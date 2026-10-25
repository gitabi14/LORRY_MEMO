import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import '../models/lorry.dart';
import '../models/memo.dart';

class AppRepository {
  static const String _lorriesKey = 'flutter_lorries_v1';
  static const String _memosKey = 'flutter_memos_v1';

  final _uuid = const Uuid();

  Future<List<Lorry>> getLorries() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_lorriesKey);
    if (raw == null) {
      final initial = _getInitialLorries();
      await saveLorries(initial);
      return initial;
    }
    try {
      final list = jsonDecode(raw) as List<dynamic>;
      return list.map((e) => Lorry.fromJson(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return _getInitialLorries();
    }
  }

  Future<void> saveLorries(List<Lorry> lorries) async {
    final prefs = await SharedPreferences.getInstance();
    final data = jsonEncode(lorries.map((e) => e.toJson()).toList());
    await prefs.setString(_lorriesKey, data);
  }

  Future<Lorry> addLorry(String registrationNumber, [String? nickname]) async {
    final cleanReg = registrationNumber.trim().toUpperCase();
    final all = await getLorries();
    final duplicate = all.any(
      (l) => l.registrationNumber.replaceAll(RegExp(r'\s+'), '') == cleanReg.replaceAll(RegExp(r'\s+'), ''),
    );
    if (duplicate) {
      throw Exception('Lorry $cleanReg is already registered / ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது');
    }

    final now = DateTime.now();
    final newLorry = Lorry(
      id: _uuid.v4(),
      registrationNumber: cleanReg,
      nickname: nickname?.trim(),
      createdAt: now,
      updatedAt: now,
    );

    all.add(newLorry);
    await saveLorries(all);
    return newLorry;
  }

  Future<void> deleteLorry(String lorryId) async {
    final allLorries = await getLorries();
    allLorries.removeWhere((l) => l.id === lorryId);
    await saveLorries(allLorries);

    // Also delete child memos
    final allMemos = await getAllMemos();
    allMemos.removeWhere((m) => m.lorryId == lorryId);
    await _saveMemos(allMemos);
  }

  Future<List<Memo>> getAllMemos() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_memosKey);
    if (raw == null) {
      final initial = _getInitialMemos();
      await _saveMemos(initial);
      return initial;
    }
    try {
      final list = jsonDecode(raw) as List<dynamic>;
      return list.map((e) => Memo.fromJson(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return _getInitialMemos();
    }
  }

  Future<void> _saveMemos(List<Memo> memos) async {
    final prefs = await SharedPreferences.getInstance();
    final data = jsonEncode(memos.map((e) => e.toJson()).toList());
    await prefs.setString(_memosKey, data);
  }

  Future<List<Memo>> getMemosForLorry(String lorryId, {bool newestFirst = true}) async {
    final all = await getAllMemos();
    final filtered = all.where((m) => m.lorryId == lorryId).toList();
    filtered.sort((a, b) => newestFirst
        ? b.createdAt.compareTo(a.createdAt)
        : a.createdAt.compareTo(b.createdAt));
    return filtered;
  }

  Future<String> getNextMemoNumber(String lorryId) async {
    final memos = await getMemosForLorry(lorryId);
    if (memos.isEmpty) return 'MEMO-001';

    int maxNum = 0;
    for (final m in memos) {
      final match = RegExp(r'\d+').firstMatch(m.memoNumber);
      if (match != null) {
        final val = int.tryParse(match.group(0)!) ?? 0;
        if (val > maxNum) maxNum = val;
      }
    }
    final next = maxNum + 1;
    return 'MEMO-${next.toString().padLeft(3, '0')}';
  }

  Future<Memo> saveMemo(Memo memo) async {
    final all = await getAllMemos();
    final existingIndex = all.indexWhere((m) => m.id == memo.id);

    final now = DateTime.now();
    memo.updatedAt = now;

    if (existingIndex >= 0) {
      // Preserve creation timestamp
      all[existingIndex] = memo;
    } else {
      all.add(memo);
    }

    await _saveMemos(all);
    return memo;
  }

  Future<void> deleteMemo(String memoId) async {
    final all = await getAllMemos();
    all.removeWhere((m) => m.id == memoId);
    await _saveMemos(all);
  }

  List<Lorry> _getInitialLorries() {
    final now = DateTime.now();
    return [
      Lorry(
        id: '11111111-1111-1111-1111-111111111111',
        registrationNumber: 'TN 36 AB 1234',
        nickname: 'ராஜா லாரி (Raja Transport)',
        createdAt: now.subtract(const Duration(days: 7)),
        updatedAt: now.subtract(const Duration(days: 7)),
      ),
      Lorry(
        id: '22222222-2222-2222-2222-222222222222',
        registrationNumber: 'TN 38 CD 5678',
        nickname: 'அம்மன் லாரி (Amman Express)',
        createdAt: now.subtract(const Duration(days: 5)),
        updatedAt: now.subtract(const Duration(days: 5)),
      ),
    ];
  }

  List<Memo> _getInitialMemos() {
    final now = DateTime.now();
    return [
      Memo(
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        lorryId: '11111111-1111-1111-1111-111111111111',
        memoNumber: 'MEMO-001',
        tripDate: DateTime.parse('2026-10-20'),
        fromDate: DateTime.parse('2026-10-20'),
        toDate: DateTime.parse('2026-10-23'),
        driverName1: 'முத்து (Muthu)',
        cleanerName: 'குமார் (Kumar)',
        startingKm: 142500,
        endingKm: 143240,
        totalKm: 740,
        advanceAmount: 26000,
        driverBatta: 1500,
        cleanerBatta: 700,
        workshopExpense: 450,
        bridgeExpense: 350,
        nakaExpense: 200,
        notes: 'சேலம் டு சென்னை ட்ரிப் - லோடு மற்றும் RTO கணக்கு சரிபார்க்கப்பட்டது',
        createdAt: now.subtract(const Duration(days: 5)),
        updatedAt: now.subtract(const Duration(days: 2)),
        loads: [
          MemoLoad(
            id: 'l1',
            route: 'சேலம் To சென்னை (Salem To Chennai)',
            loadDescription: 'ஸ்டீல் கம்பி (Steel Rods)',
            weightTonnes: 16.5,
            freightAmount: 26000,
            commission: 500,
            loadingCharges: 400,
            unloadingCharges: 300,
            rowOrder: 1,
          ),
        ],
        dieselEntries: [
          DieselEntry(
            id: 'd1',
            litres: 110,
            amount: 10450,
            billDetails: 'சேலம் HP பங்க் #9842',
            rowOrder: 1,
          ),
        ],
        otherExpenses: [
          ExpenseRow(id: 'o1', itemName: 'டயர் பன்சர்', amount: 250, rowOrder: 1),
          ExpenseRow(id: 'o2', itemName: 'வண்டி வாஷ்', amount: 300, rowOrder: 2),
        ],
        // Exact numbers from handwritten Tamil ledger photo (rot90_img1.jpg)
        rtoExpenses: [
          ExpenseRow(id: 'r1', itemName: 'சின்னசேலம் (Chinnasalem)', amount: 3800, rowOrder: 1),
          ExpenseRow(id: 'r2', itemName: 'சுங்கம் (Toll / Sungam)', amount: 1000, rowOrder: 2),
          ExpenseRow(id: 'r3', itemName: 'நாமக்கல் (Namakkal)', amount: 100, rowOrder: 3),
          ExpenseRow(id: 'r4', itemName: 'திடீர் (Thideer)', amount: 100, rowOrder: 4),
          ExpenseRow(id: 'r5', itemName: 'பெரியசேலம் (Periyaselam)', amount: 300, rowOrder: 5),
          ExpenseRow(id: 'r6', itemName: 'சேலம் (Salem)', amount: 300, rowOrder: 6),
          ExpenseRow(id: 'r7', itemName: 'இடபூண்டி (Edappadi)', amount: 300, rowOrder: 7),
          ExpenseRow(id: 'r8', itemName: 'P.C. மாமூல் 1', amount: 200, rowOrder: 8),
          ExpenseRow(id: 'r9', itemName: 'P.C. மாமூல் 2', amount: 150, rowOrder: 9),
        ],
      ),
    ];
  }
}

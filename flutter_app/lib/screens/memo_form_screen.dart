import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../models/lorry.dart';
import '../models/memo.dart';
import '../services/app_repository.dart';
import '../utils/calculations.dart';
import '../utils/formatters.dart';
import '../widgets/dynamic_expense_table_widget.dart';

class MemoFormScreen extends StatefulWidget {
  final Lorry lorry;
  final AppRepository repository;
  final Memo? existingMemo;

  const MemoFormScreen({
    super.key,
    required this.lorry,
    required this.repository,
    this.existingMemo,
  });

  @override
  State<MemoFormScreen> createState() => _MemoFormScreenState();
}

class _MemoFormScreenState extends State<MemoFormScreen> {
  final _uuid = const Uuid();
  late Memo _memo;
  bool _isSaving = false;

  final rtoQuickSuggestions = [
    'சின்னசேலம் (3800)',
    'சுங்கம் (1000)',
    'நாமக்கல் (100)',
    'திடீர் (100)',
    'பெரியசேலம் (300)',
    'சேலம் (300)',
    'இடபூண்டி (300)',
    'P.C. மாமூல்',
  ];

  final otherQuickSuggestions = [
    'டயர் பன்சர்',
    'வண்டி வாஷ்',
    'கிரீஸ் & ஆயில்',
    'தார்பாய் கயிறு',
    'டீ & சிற்றுண்டி',
  ];

  @override
  void initState() {
    super.initState();
    if (widget.existingMemo != null) {
      _memo = widget.existingMemo!;
    } else {
      final now = DateTime.now();
      _memo = Memo(
        id: _uuid.v4(),
        lorryId: widget.lorry.id,
        memoNumber: '',
        tripDate: now,
        fromDate: now,
        toDate: now,
        advanceAmount: 0.0,
        createdAt: now,
        updatedAt: now,
      );
      widget.repository.getNextMemoNumber(widget.lorry.id).then((next) {
        if (mounted) setState(() => _memo.memoNumber = next);
      });
    }
  }

  void _addLoadRow() {
    setState(() {
      _memo.loads.add(MemoLoad(
        id: _uuid.v4(),
        memoId: _memo.id,
        route: '',
        freightAmount: 0.0,
        commission: 0.0,
        loadingCharges: 0.0,
        unloadingCharges: 0.0,
        rowOrder: _memo.loads.length + 1,
      ));
    });
  }

  void _addDieselRow() {
    setState(() {
      _memo.dieselEntries.add(DieselEntry(
        id: _uuid.v4(),
        memoId: _memo.id,
        litres: 0.0,
        amount: 0.0,
        rowOrder: _memo.dieselEntries.length + 1,
      ));
    });
  }

  Future<void> _save() async {
    if (_memo.memoNumber.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Memo number is required')),
      );
      return;
    }

    setState(() => _isSaving = true);
    try {
      await widget.repository.saveMemo(_memo);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Memo saved successfully!')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final calc = calculateMemoTotals(_memo);
    final isProfit = calc.netBalance >= 0;

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.existingMemo != null ? 'Edit ${_memo.memoNumber}' : 'New Memo',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            Text(widget.lorry.registrationNumber, style: const TextStyle(fontSize: 11)),
          ],
        ),
        actions: [
          IconButton(
            icon: _isSaving ? const CircularProgressIndicator(color: Colors.white) : const Icon(Icons.check),
            onPressed: _isSaving ? null : _save,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Core Trip Details
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Trip & Vehicle Details / பயண விபரம்', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            initialValue: _memo.memoNumber,
                            decoration: const InputDecoration(labelText: 'Memo No *', isDense: true),
                            onChanged: (v) => _memo.memoNumber = v,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextFormField(
                            initialValue: _memo.advanceAmount == 0 ? '' : _memo.advanceAmount.toString(),
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Advance (அட்வான்ஸ்) ₹', isDense: true),
                            onChanged: (v) => setState(() => _memo.advanceAmount = double.tryParse(v) ?? 0.0),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            initialValue: _memo.driverName1 ?? '',
                            decoration: const InputDecoration(labelText: 'Driver 1', isDense: true),
                            onChanged: (v) => _memo.driverName1 = v,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextFormField(
                            initialValue: _memo.cleanerName ?? '',
                            decoration: const InputDecoration(labelText: 'Cleaner', isDense: true),
                            onChanged: (v) => _memo.cleanerName = v,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            initialValue: _memo.startingKm == null ? '' : _memo.startingKm.toString(),
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'Start KM', isDense: true),
                            onChanged: (v) => setState(() => _memo.startingKm = double.tryParse(v)),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextFormField(
                            initialValue: _memo.endingKm == null ? '' : _memo.endingKm.toString(),
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(labelText: 'End KM', isDense: true),
                            onChanged: (v) => setState(() => _memo.endingKm = double.tryParse(v)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // 2. Load and Income Table
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('1. Loads & Freight Income (வரவு)', style: TextStyle(fontWeight: FontWeight.bold)),
                        Text(
                          Formatters.inr(calc.totalIncome),
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ..._memo.loads.asMap().entries.map((entry) {
                      final i = entry.key;
                      final load = entry.value;
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.green.shade50.withOpacity(0.5),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.green.shade200),
                        ),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  flex: 6,
                                  child: TextFormField(
                                    initialValue: load.route,
                                    decoration: const InputDecoration(
                                      hintText: 'Route (Salem To Chennai)',
                                      isDense: true,
                                    ),
                                    onChanged: (v) => load.route = v,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  flex: 4,
                                  child: TextFormField(
                                    initialValue: load.freightAmount == 0 ? '' : load.freightAmount.toString(),
                                    keyboardType: TextInputType.number,
                                    decoration: const InputDecoration(
                                      prefixText: '₹ ',
                                      hintText: 'Freight ₹',
                                      isDense: true,
                                    ),
                                    onChanged: (v) => setState(() => load.freightAmount = double.tryParse(v) ?? 0.0),
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, size: 18, color: Colors.red),
                                  onPressed: () => setState(() => _memo.loads.removeAt(i)),
                                ),
                              ],
                            ),
                            Row(
                              children: [
                                Expanded(
                                  child: TextFormField(
                                    initialValue: load.commission == 0 ? '' : load.commission.toString(),
                                    keyboardType: TextInputType.number,
                                    decoration: const InputDecoration(hintText: 'Comm ₹', isDense: true),
                                    onChanged: (v) => setState(() => load.commission = double.tryParse(v) ?? 0.0),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: TextFormField(
                                    initialValue: load.loadingCharges == 0 ? '' : load.loadingCharges.toString(),
                                    keyboardType: TextInputType.number,
                                    decoration: const InputDecoration(hintText: 'Loading ₹', isDense: true),
                                    onChanged: (v) => setState(() => load.loadingCharges = double.tryParse(v) ?? 0.0),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: TextFormField(
                                    initialValue: load.unloadingCharges == 0 ? '' : load.unloadingCharges.toString(),
                                    keyboardType: TextInputType.number,
                                    decoration: const InputDecoration(hintText: 'Unloading ₹', isDense: true),
                                    onChanged: (v) => setState(() => load.unloadingCharges = double.tryParse(v) ?? 0.0),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    }),
                    TextButton.icon(
                      icon: const Icon(Icons.add, size: 16),
                      label: const Text('Add Load / புதிய லோடு'),
                      onPressed: _addLoadRow,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // 3. Diesel Entries
            Card(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('2. Diesel Entries (டீசல்)', style: TextStyle(fontWeight: FontWeight.bold)),
                        Text(
                          '${calc.totalDieselLitres} L • ${Formatters.inr(calc.totalDieselExpense)}',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.orange),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ..._memo.dieselEntries.asMap().entries.map((entry) {
                      final i = entry.key;
                      final d = entry.value;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Row(
                          children: [
                            Expanded(
                              flex: 3,
                              child: TextFormField(
                                initialValue: d.litres == 0 ? '' : d.litres.toString(),
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(hintText: 'Litres', isDense: true),
                                onChanged: (v) => setState(() => d.litres = double.tryParse(v) ?? 0.0),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              flex: 4,
                              child: TextFormField(
                                initialValue: d.amount == 0 ? '' : d.amount.toString(),
                                keyboardType: TextInputType.number,
                                decoration: const InputDecoration(prefixText: '₹ ', hintText: 'Paid ₹', isDense: true),
                                onChanged: (v) => setState(() => d.amount = double.tryParse(v) ?? 0.0),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              flex: 4,
                              child: TextFormField(
                                initialValue: d.billDetails ?? '',
                                decoration: const InputDecoration(hintText: 'Bunk/Bill', isDense: true),
                                onChanged: (v) => d.billDetails = v,
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.delete_outline, size: 18, color: Colors.red),
                              onPressed: () => setState(() => _memo.dieselEntries.removeAt(i)),
                            ),
                          ],
                        ),
                      );
                    }),
                    TextButton.icon(
                      icon: const Icon(Icons.add, size: 16),
                      label: const Text('Add Diesel / டீசல் சேர்க்க'),
                      onPressed: _addDieselRow,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 12),

            // 4. Other Expenses (Reusable Dynamic Table)
            DynamicExpenseTableWidget(
              title: '3. Other Expenses',
              tamilTitle: 'இதர செலவுகள்',
              totalLabel: 'Other Total',
              rows: _memo.otherExpenses,
              quickSuggestions: otherQuickSuggestions,
              themeColor: Colors.indigo,
              onChanged: (rows) => setState(() => _memo.otherExpenses = rows),
            ),
            const SizedBox(height: 12),

            // 5. RTO & PC Expenses (Exact same reusable widget!)
            DynamicExpenseTableWidget(
              title: '4. RTO & PC Expenses',
              tamilTitle: 'RTO & PC செலவு',
              totalLabel: 'RTO & PC Total',
              rows: _memo.rtoExpenses,
              quickSuggestions: rtoQuickSuggestions,
              themeColor: Colors.blue,
              onChanged: (rows) => setState(() => _memo.rtoExpenses = rows),
            ),
            const SizedBox(height: 12),

            // 6. Summary Card
            Card(
              color: isProfit ? Colors.green.shade900 : Colors.red.shade900,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('TOTAL INCOME (வரவு):', style: TextStyle(color: Colors.white70, fontSize: 12)),
                        Text(Formatters.inr(calc.totalIncome), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('TOTAL EXPENSES (செலவு):', style: TextStyle(color: Colors.white70, fontSize: 12)),
                        Text(Formatters.inr(calc.totalExpenses), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    const Divider(color: Colors.white24, height: 16),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'FINAL BALANCE (மீதி):',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        Text(
                          Formatters.inr(calc.netBalance),
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Bottom Save button
            ElevatedButton.icon(
              icon: _isSaving ? const CircularProgressIndicator(color: Colors.white) : const Icon(Icons.save),
              label: Text(_isSaving ? 'Saving...' : 'Save Memo / அட்டவணையை சேமிக்க'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                backgroundColor: Colors.green.shade700,
                foregroundColor: Colors.white,
              ),
              onPressed: _isSaving ? null : _save,
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

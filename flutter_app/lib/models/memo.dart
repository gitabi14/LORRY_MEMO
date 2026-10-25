class MemoLoad {
  String id;
  String? memoId;
  DateTime? loadDate;
  String route;
  String? loadDescription;
  double? weightTonnes;
  double freightAmount;
  double commission;
  double loadingCharges;
  double unloadingCharges;
  double otherCharges;
  int rowOrder;

  MemoLoad({
    required this.id,
    this.memoId,
    this.loadDate,
    required this.route,
    this.loadDescription,
    this.weightTonnes,
    this.freightAmount = 0.0,
    this.commission = 0.0,
    this.loadingCharges = 0.0,
    this.unloadingCharges = 0.0,
    this.otherCharges = 0.0,
    this.rowOrder = 0,
  });

  factory MemoLoad.fromJson(Map<String, dynamic> json) {
    return MemoLoad(
      id: json['id'] as String,
      memoId: json['memo_id'] as String?,
      loadDate: json['load_date'] != null ? DateTime.tryParse(json['load_date'] as String) : null,
      route: json['route'] as String? ?? '',
      loadDescription: json['load_description'] as String?,
      weightTonnes: (json['weight_tonnes'] as num?)?.toDouble(),
      freightAmount: (json['freight_amount'] as num?)?.toDouble() ?? 0.0,
      commission: (json['commission'] as num?)?.toDouble() ?? 0.0,
      loadingCharges: (json['loading_charges'] as num?)?.toDouble() ?? 0.0,
      unloadingCharges: (json['unloading_charges'] as num?)?.toDouble() ?? 0.0,
      otherCharges: (json['other_charges'] as num?)?.toDouble() ?? 0.0,
      rowOrder: json['row_order'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'memo_id': memoId,
      'load_date': loadDate?.toIso8601String().split('T').first,
      'route': route,
      'load_description': loadDescription,
      'weight_tonnes': weightTonnes,
      'freight_amount': freightAmount,
      'commission': commission,
      'loading_charges': loadingCharges,
      'unloading_charges': unloadingCharges,
      'other_charges': otherCharges,
      'row_order': rowOrder,
    };
  }
}

class DieselEntry {
  String id;
  String? memoId;
  DateTime? entryDate;
  double litres;
  double amount;
  String? billDetails;
  int rowOrder;

  DieselEntry({
    required this.id,
    this.memoId,
    this.entryDate,
    this.litres = 0.0,
    this.amount = 0.0,
    this.billDetails,
    this.rowOrder = 0,
  });

  factory DieselEntry.fromJson(Map<String, dynamic> json) {
    return DieselEntry(
      id: json['id'] as String,
      memoId: json['memo_id'] as String?,
      entryDate: json['entry_date'] != null ? DateTime.tryParse(json['entry_date'] as String) : null,
      litres: (json['litres'] as num?)?.toDouble() ?? 0.0,
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      billDetails: json['bill_details'] as String?,
      rowOrder: json['row_order'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'memo_id': memoId,
      'entry_date': entryDate?.toIso8601String().split('T').first,
      'litres': litres,
      'amount': amount,
      'bill_details': billDetails,
      'row_order': rowOrder,
    };
  }
}

class ExpenseRow {
  String id;
  String? memoId;
  String itemName;
  double amount;
  int rowOrder;

  ExpenseRow({
    required this.id,
    this.memoId,
    required this.itemName,
    this.amount = 0.0,
    this.rowOrder = 0,
  });

  factory ExpenseRow.fromJson(Map<String, dynamic> json) {
    return ExpenseRow(
      id: json['id'] as String,
      memoId: json['memo_id'] as String?,
      itemName: json['item_name'] as String? ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      rowOrder: json['row_order'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'memo_id': memoId,
      'item_name': itemName,
      'amount': amount,
      'row_order': rowOrder,
    };
  }
}

class Memo {
  final String id;
  final String lorryId;
  String memoNumber;
  DateTime tripDate;
  DateTime? fromDate;
  DateTime? toDate;
  String? driverName1;
  String? driverName2;
  String? cleanerName;
  String? managerName;
  double? startingKm;
  double? endingKm;
  double? totalKm;
  double advanceAmount;
  double driverBatta;
  double cleanerBatta;
  double workshopExpense;
  double bridgeExpense;
  double nakaExpense;
  double billsExpense;
  String? notes;
  final DateTime createdAt;
  DateTime updatedAt;

  List<MemoLoad> loads;
  List<DieselEntry> dieselEntries;
  List<ExpenseRow> otherExpenses;
  List<ExpenseRow> rtoExpenses;

  Memo({
    required this.id,
    required this.lorryId,
    required this.memoNumber,
    required this.tripDate,
    this.fromDate,
    this.toDate,
    this.driverName1,
    this.driverName2,
    this.cleanerName,
    this.managerName,
    this.startingKm,
    this.endingKm,
    this.totalKm,
    this.advanceAmount = 0.0,
    this.driverBatta = 0.0,
    this.cleanerBatta = 0.0,
    this.workshopExpense = 0.0,
    this.bridgeExpense = 0.0,
    this.nakaExpense = 0.0,
    this.billsExpense = 0.0,
    this.notes,
    required this.createdAt,
    required this.updatedAt,
    List<MemoLoad>? loads,
    List<DieselEntry>? dieselEntries,
    List<ExpenseRow>? otherExpenses,
    List<ExpenseRow>? rtoExpenses,
  })  : loads = loads ?? [],
        dieselEntries = dieselEntries ?? [],
        otherExpenses = otherExpenses ?? [],
        rtoExpenses = rtoExpenses ?? [];

  factory Memo.fromJson(Map<String, dynamic> json) {
    return Memo(
      id: json['id'] as String,
      lorryId: json['lorry_id'] as String,
      memoNumber: json['memo_number'] as String,
      tripDate: DateTime.parse(json['trip_date'] as String),
      fromDate: json['from_date'] != null ? DateTime.tryParse(json['from_date'] as String) : null,
      toDate: json['to_date'] != null ? DateTime.tryParse(json['to_date'] as String) : null,
      driverName1: json['driver_name_1'] as String?,
      driverName2: json['driver_name_2'] as String?,
      cleanerName: json['cleaner_name'] as String?,
      managerName: json['manager_name'] as String?,
      startingKm: (json['starting_km'] as num?)?.toDouble(),
      endingKm: (json['ending_km'] as num?)?.toDouble(),
      totalKm: (json['total_km'] as num?)?.toDouble(),
      advanceAmount: (json['advance_amount'] as num?)?.toDouble() ?? 0.0,
      driverBatta: (json['driver_batta'] as num?)?.toDouble() ?? 0.0,
      cleanerBatta: (json['cleaner_batta'] as num?)?.toDouble() ?? 0.0,
      workshopExpense: (json['workshop_expense'] as num?)?.toDouble() ?? 0.0,
      bridgeExpense: (json['bridge_expense'] as num?)?.toDouble() ?? 0.0,
      nakaExpense: (json['naka_expense'] as num?)?.toDouble() ?? 0.0,
      billsExpense: (json['bills_expense'] as num?)?.toDouble() ?? 0.0,
      notes: json['notes'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
      loads: (json['loads'] as List<dynamic>?)
              ?.map((e) => MemoLoad.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      dieselEntries: (json['diesel_entries'] as List<dynamic>?)
              ?.map((e) => DieselEntry.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      otherExpenses: (json['other_expenses'] as List<dynamic>?)
              ?.map((e) => ExpenseRow.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      rtoExpenses: (json['rto_expenses'] as List<dynamic>?)
              ?.map((e) => ExpenseRow.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'lorry_id': lorryId,
      'memo_number': memoNumber,
      'trip_date': tripDate.toIso8601String().split('T').first,
      'from_date': fromDate?.toIso8601String().split('T').first,
      'to_date': toDate?.toIso8601String().split('T').first,
      'driver_name_1': driverName1,
      'driver_name_2': driverName2,
      'cleaner_name': cleanerName,
      'manager_name': managerName,
      'starting_km': startingKm,
      'ending_km': endingKm,
      'total_km': totalKm,
      'advance_amount': advanceAmount,
      'driver_batta': driverBatta,
      'cleaner_batta': cleanerBatta,
      'workshop_expense': workshopExpense,
      'bridge_expense': bridgeExpense,
      'naka_expense': nakaExpense,
      'bills_expense': billsExpense,
      'notes': notes,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'loads': loads.map((e) => e.toJson()).toList(),
      'diesel_entries': dieselEntries.map((e) => e.toJson()).toList(),
      'other_expenses': otherExpenses.map((e) => e.toJson()).toList(),
      'rto_expenses': rtoExpenses.map((e) => e.toJson()).toList(),
    };
  }
}

class CalculationResult {
  final double totalIncome;
  final double totalDieselExpense;
  final double totalDieselLitres;
  final double? mileage;

  final double totalCommission;
  final double totalLoadingCharges;
  final double totalUnloadingCharges;
  final double totalLoadOtherCharges;

  final double totalOtherExpenses;
  final double totalRtoExpenses;

  final double driverBatta;
  final double cleanerBatta;
  final double workshopExpense;
  final double bridgeExpense;
  final double nakaExpense;
  final double billsExpense;

  final double totalExpenses;
  final double netBalance;
  final double advanceAmount;
  final double balanceWithAdvance;

  CalculationResult({
    required this.totalIncome,
    required this.totalDieselExpense,
    required this.totalDieselLitres,
    this.mileage,
    required this.totalCommission,
    required this.totalLoadingCharges,
    required this.totalUnloadingCharges,
    required this.totalLoadOtherCharges,
    required this.totalOtherExpenses,
    required this.totalRtoExpenses,
    required this.driverBatta,
    required this.cleanerBatta,
    required this.workshopExpense,
    required this.bridgeExpense,
    required this.nakaExpense,
    required this.billsExpense,
    required this.totalExpenses,
    required this.netBalance,
    required this.advanceAmount,
    required this.balanceWithAdvance,
  });
}

import '../models/memo.dart';
import '../models/calculation_result.dart';

int toPaise(double amount) {
  return (amount * 100).round();
}

double fromPaise(int paise) {
  return paise / 100.0;
}

CalculationResult calculateMemoTotals(Memo memo) {
  int totalIncomePaise = 0;
  int totalCommissionPaise = 0;
  int totalLoadingPaise = 0;
  int totalUnloadingPaise = 0;
  int totalLoadOtherPaise = 0;

  for (final load in memo.loads) {
    totalIncomePaise += toPaise(load.freightAmount);
    totalCommissionPaise += toPaise(load.commission);
    totalLoadingPaise += toPaise(load.loadingCharges);
    totalUnloadingPaise += toPaise(load.unloadingCharges);
    totalLoadOtherPaise += toPaise(load.otherCharges);
  }

  double totalDieselLitres = 0.0;
  int totalDieselPaise = 0;

  for (final diesel in memo.dieselEntries) {
    totalDieselLitres += diesel.litres;
    totalDieselPaise += toPaise(diesel.amount);
  }

  final startingKm = memo.startingKm ?? 0.0;
  final endingKm = memo.endingKm ?? 0.0;
  double totalKm = memo.totalKm ?? 0.0;

  if (endingKm > 0 && startingKm > 0 && endingKm >= startingKm) {
    totalKm = endingKm - startingKm;
  }

  double? mileage;
  if (totalKm > 0 && totalDieselLitres > 0) {
    mileage = double.parse((totalKm / totalDieselLitres).toStringAsFixed(2));
  }

  int totalOtherPaise = 0;
  for (final exp in memo.otherExpenses) {
    totalOtherPaise += toPaise(exp.amount);
  }

  int totalRtoPaise = 0;
  for (final rto in memo.rtoExpenses) {
    totalRtoPaise += toPaise(rto.amount);
  }

  final driverBattaPaise = toPaise(memo.driverBatta);
  final cleanerBattaPaise = toPaise(memo.cleanerBatta);
  final workshopPaise = toPaise(memo.workshopExpense);
  final bridgePaise = toPaise(memo.bridgeExpense);
  final nakaPaise = toPaise(memo.nakaExpense);
  final billsPaise = toPaise(memo.billsExpense);
  final advancePaise = toPaise(memo.advanceAmount);

  final totalExpensesPaise = totalDieselPaise +
      totalCommissionPaise +
      totalLoadingPaise +
      totalUnloadingPaise +
      totalLoadOtherPaise +
      totalOtherPaise +
      totalRtoPaise +
      driverBattaPaise +
      cleanerBattaPaise +
      workshopPaise +
      bridgePaise +
      nakaPaise +
      billsPaise;

  final netBalancePaise = totalIncomePaise - totalExpensesPaise;
  final balanceWithAdvancePaise = advancePaise - totalExpensesPaise;

  return CalculationResult(
    totalIncome: fromPaise(totalIncomePaise),
    totalDieselExpense: fromPaise(totalDieselPaise),
    totalDieselLitres: double.parse(totalDieselLitres.toStringAsFixed(2)),
    mileage: mileage,
    totalCommission: fromPaise(totalCommissionPaise),
    totalLoadingCharges: fromPaise(totalLoadingPaise),
    totalUnloadingCharges: fromPaise(totalUnloadingPaise),
    totalLoadOtherCharges: fromPaise(totalLoadOtherPaise),
    totalOtherExpenses: fromPaise(totalOtherPaise),
    totalRtoExpenses: fromPaise(totalRtoPaise),
    driverBatta: fromPaise(driverBattaPaise),
    cleanerBatta: fromPaise(cleanerBattaPaise),
    workshopExpense: fromPaise(workshopPaise),
    bridgeExpense: fromPaise(bridgePaise),
    nakaExpense: fromPaise(nakaPaise),
    billsExpense: fromPaise(billsPaise),
    totalExpenses: fromPaise(totalExpensesPaise),
    netBalance: fromPaise(netBalancePaise),
    advanceAmount: fromPaise(advancePaise),
    balanceWithAdvance: fromPaise(balanceWithAdvancePaise),
  );
}

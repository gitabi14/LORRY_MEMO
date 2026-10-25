import 'package:intl/intl.dart';

class Formatters {
  static final NumberFormat _inrFormatter = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹ ',
    decimalDigits: 2,
  );

  static final NumberFormat _compactInrFormatter = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹ ',
    decimalDigits: 0,
  );

  static String inr(double? amount) {
    if (amount == null) return '₹ 0.00';
    return _inrFormatter.format(amount);
  }

  static String inrCompact(double? amount) {
    if (amount == null) return '₹ 0';
    return _compactInrFormatter.format(amount);
  }

  static String istDate(DateTime? date) {
    if (date == null) return '—';
    return DateFormat('dd MMM yyyy').format(date);
  }

  static String istDateTime(DateTime? dateTime) {
    if (dateTime == null) return '—';
    return DateFormat('dd MMM yyyy, hh:mm a').format(dateTime);
  }
}

import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../models/memo.dart';
import '../utils/formatters.dart';

class DynamicExpenseTableWidget extends StatefulWidget {
  final String title;
  final String tamilTitle;
  final String totalLabel;
  final List<ExpenseRow> rows;
  final ValueChanged<List<ExpenseRow>> onChanged;
  final List<String> quickSuggestions;
  final Color themeColor;

  const DynamicExpenseTableWidget({
    super.key,
    required this.title,
    required this.tamilTitle,
    required this.totalLabel,
    required this.rows,
    required this.onChanged,
    this.quickSuggestions = const [],
    this.themeColor = Colors.indigo,
  });

  @override
  State<DynamicExpenseTableWidget> createState() => _DynamicExpenseTableWidgetState();
}

class _DynamicExpenseTableWidgetState extends State<DynamicExpenseTableWidget> {
  final _uuid = const Uuid();

  double get _totalAmount {
    return widget.rows.fold(0.0, (sum, item) => sum + item.amount);
  }

  void _addRow([String? suggestedName]) {
    final updated = List<ExpenseRow>.from(widget.rows);
    updated.add(ExpenseRow(
      id: _uuid.v4(),
      itemName: suggestedName ?? '',
      amount: 0.0,
      rowOrder: updated.length + 1,
    ));
    widget.onChanged(updated);
  }

  void _removeRow(int index) {
    final updated = List<ExpenseRow>.from(widget.rows);
    updated.removeAt(index);
    widget.onChanged(updated);
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0.5,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey.shade300),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: widget.themeColor.withOpacity(0.08),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.title,
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: widget.themeColor.shade900,
                      ),
                    ),
                    Text(
                      widget.tamilTitle,
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey.shade700,
                      ),
                    ),
                  ],
                ),
                Text(
                  Formatters.inr(_totalAmount),
                  style: TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 15,
                    color: widget.themeColor.shade900,
                  ),
                ),
              ],
            ),
          ),

          // Quick suggestions chips
          if (widget.quickSuggestions.isNotEmpty)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              color: Colors.grey.shade50,
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: widget.quickSuggestions.map((s) {
                    return Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: ActionChip(
                        label: Text(s, style: const TextStyle(fontSize: 11)),
                        backgroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(6),
                          side: BorderSide(color: Colors.grey.shade300),
                        ),
                        onPressed: () => _addRow(s),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),

          // Rows
          if (widget.rows.isEmpty)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Center(
                child: Text(
                  'No rows added. Click "Add Row" below.',
                  style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: widget.rows.length,
              separatorBuilder: (_, __) => Divider(height: 1, color: Colors.grey.shade200),
              itemBuilder: (context, index) {
                final row = widget.rows[index];
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  child: Row(
                    children: [
                      Text(
                        '${index + 1}.',
                        style: TextStyle(fontSize: 11, color: Colors.grey.shade500),
                      ),
                      const SizedBox(width: 8),
                      // Item name
                      Expanded(
                        flex: 5,
                        child: TextFormField(
                          initialValue: row.itemName,
                          decoration: InputDecoration(
                            isDense: true,
                            hintText: 'Expense Item',
                            hintStyle: TextStyle(fontSize: 12, color: Colors.grey.shade400),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(6)),
                          ),
                          style: const TextStyle(fontSize: 12),
                          onChanged: (val) {
                            row.itemName = val;
                            widget.onChanged(widget.rows);
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Amount
                      Expanded(
                        flex: 4,
                        child: TextFormField(
                          initialValue: row.amount == 0 ? '' : row.amount.toString(),
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          textAlign: TextAlign.right,
                          decoration: InputDecoration(
                            prefixText: '₹ ',
                            isDense: true,
                            hintText: '0.00',
                            contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(6)),
                          ),
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          onChanged: (val) {
                            row.amount = double.tryParse(val) ?? 0.0;
                            widget.onChanged(widget.rows);
                          },
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline, size: 18, color: Colors.red),
                        onPressed: () => _removeRow(index),
                      ),
                    ],
                  ),
                );
              },
            ),

          // Total & Add Row button
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: const BorderRadius.vertical(bottom: Radius.circular(12)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                OutlinedButton.icon(
                  icon: const Icon(Icons.add, size: 14),
                  label: const Text('Add Row / சேர்க்க', style: TextStyle(fontSize: 12)),
                  onPressed: () => _addRow(),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  ),
                ),
                Text(
                  '${widget.totalLabel}: ${Formatters.inr(_totalAmount)}',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

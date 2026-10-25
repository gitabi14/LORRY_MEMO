import 'package:flutter/material.dart';
import '../models/lorry.dart';
import '../models/memo.dart';
import '../services/app_repository.dart';
import '../utils/calculations.dart';
import '../utils/formatters.dart';
import 'memo_form_screen.dart';

class MemoListScreen extends StatefulWidget {
  final Lorry lorry;
  final AppRepository repository;

  const MemoListScreen({
    super.key,
    required this.lorry,
    required this.repository,
  });

  @override
  State<MemoListScreen> createState() => _MemoListScreenState();
}

class _MemoListScreenState extends State<MemoListScreen> {
  List<Memo> _memos = [];
  bool _isLoading = true;
  bool _newestFirst = true;

  @override
  void initState() {
    super.initState();
    _loadMemos();
  }

  Future<void> _loadMemos() async {
    setState(() => _isLoading = true);
    final list = await widget.repository.getMemosForLorry(widget.lorry.id, newestFirst: _newestFirst);
    setState(() {
      _memos = list;
      _isLoading = false;
    });
  }

  void _confirmDeleteMemo(Memo memo) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Delete ${memo.memoNumber}?'),
        content: const Text('Are you sure you want to permanently delete this memo and its entire ledger details?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () async {
              Navigator.pop(ctx);
              await widget.repository.deleteMemo(memo.id);
              _loadMemos();
            },
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(widget.lorry.registrationNumber, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17)),
            if (widget.lorry.nickname != null)
              Text(widget.lorry.nickname!, style: const TextStyle(fontSize: 11)),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(_newestFirst ? Icons.arrow_downward : Icons.arrow_upward),
            tooltip: _newestFirst ? 'Showing Newest First' : 'Showing Oldest First',
            onPressed: () {
              setState(() => _newestFirst = !_newestFirst);
              _loadMemos();
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _memos.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.receipt_long, size: 60, color: Colors.grey),
                      const SizedBox(height: 12),
                      const Text('No trip memos recorded for this vehicle.'),
                      const SizedBox(height: 10),
                      ElevatedButton.icon(
                        icon: const Icon(Icons.add),
                        label: const Text('Create New Memo'),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => MemoFormScreen(
                                lorry: widget.lorry,
                                repository: widget.repository,
                              ),
                            ),
                          ).then((_) => _loadMemos());
                        },
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: _memos.length,
                  itemBuilder: (context, index) {
                    final memo = _memos[index];
                    final calc = calculateMemoTotals(memo);
                    final isProfit = calc.netBalance >= 0;

                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      elevation: 1,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: Padding(
                        padding: const EdgeInsets.all(14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Header Row: Memo No & Balance Pill
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.description, size: 18, color: Colors.blue),
                                    const SizedBox(width: 6),
                                    Text(
                                      memo.memoNumber,
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                    ),
                                  ],
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: isProfit ? Colors.green.shade50 : Colors.red.shade50,
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.side(color: isProfit ? Colors.green.shade300 : Colors.red.shade300),
                                  ),
                                  child: Text(
                                    Formatters.inr(calc.netBalance),
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                      color: isProfit ? Colors.green.shade900 : Colors.red.shade900,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),

                            // Trip date & Saved timestamp (IST)
                            Text(
                              'Trip Date: ${Formatters.istDate(memo.tripDate)}',
                              style: TextStyle(color: Colors.grey.shade700, fontSize: 12),
                            ),
                            Text(
                              'Saved: ${Formatters.istDateTime(memo.createdAt)}',
                              style: TextStyle(color: Colors.grey.shade500, fontSize: 11),
                            ),
                            const Divider(height: 16),

                            // Financial totals row
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Income (வரவு)', style: TextStyle(color: Colors.grey.shade500, fontSize: 10)),
                                    Text(
                                      Formatters.inr(calc.totalIncome),
                                      style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green),
                                    ),
                                  ],
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text('Expense (செலவு)', style: TextStyle(color: Colors.grey.shade500, fontSize: 10)),
                                    Text(
                                      Formatters.inr(calc.totalExpenses),
                                      style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),

                            // Action buttons
                            Row(
                              mainAxisAlignment: MainAxisAlignment.end,
                              children: [
                                TextButton.icon(
                                  icon: const Icon(Icons.delete_outline, size: 16, color: Colors.red),
                                  label: const Text('Delete', style: TextStyle(color: Colors.red, fontSize: 12)),
                                  onPressed: () => _confirmDeleteMemo(memo),
                                ),
                                const SizedBox(width: 8),
                                ElevatedButton.icon(
                                  icon: const Icon(Icons.edit, size: 16),
                                  label: const Text('Open / Edit', style: TextStyle(fontSize: 12)),
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) => MemoFormScreen(
                                          lorry: widget.lorry,
                                          repository: widget.repository,
                                          existingMemo: memo,
                                        ),
                                      ),
                                    ).then((_) => _loadMemos());
                                  },
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
      floatingActionButton: FloatingActionButton.extended(
        icon: const Icon(Icons.add),
        label: const Text('New Memo / புதியது'),
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => MemoFormScreen(
                lorry: widget.lorry,
                repository: widget.repository,
              ),
            ),
          ).then((_) => _loadMemos());
        },
      ),
    );
  }
}

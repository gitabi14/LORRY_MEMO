import 'package:flutter/material.dart';
import '../models/lorry.dart';
import '../models/memo.dart';
import '../services/app_repository.dart';
import 'memo_list_screen.dart';

class LorryFoldersScreen extends StatefulWidget {
  final AppRepository repository;

  const LorryFoldersScreen({super.key, required this.repository});

  @override
  State<LorryFoldersScreen> createState() => _LorryFoldersScreenState();
}

class _LorryFoldersScreenState extends State<LorryFoldersScreen> {
  List<Lorry> _lorries = [];
  Map<String, List<Memo>> _memosByLorry = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final lorries = await widget.repository.getLorries();
    final memosMap = <String, List<Memo>>{};
    for (final l in lorries) {
      memosMap[l.id] = await widget.repository.getMemosForLorry(l.id);
    }
    setState(() {
      _lorries = lorries;
      _memosByLorry = memosMap;
      _isLoading = false;
    });
  }

  void _showAddLorryDialog() {
    final regController = TextEditingController();
    final nameController = TextEditingController();
    String? errorText;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) {
          return AlertDialog(
            title: const Text('Add New Lorry / புதிய லாரி'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (errorText != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Text(errorText!, style: const TextStyle(color: Colors.red, fontSize: 12)),
                  ),
                TextField(
                  controller: regController,
                  textCapitalization: TextCapitalization.characters,
                  decoration: const InputDecoration(
                    labelText: 'Registration Number *',
                    hintText: 'e.g. TN 36 AB 1234',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(
                    labelText: 'Nickname / Name (Optional)',
                    hintText: 'e.g. Raja / Amman',
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () async {
                  final reg = regController.text.trim();
                  if (reg.isEmpty) {
                    setDialogState(() => errorText = 'Registration number is required');
                    return;
                  }
                  try {
                    await widget.repository.addLorry(reg, nameController.text.trim());
                    Navigator.pop(ctx);
                    _loadData();
                  } catch (e) {
                    setDialogState(() => errorText = e.toString().replaceAll('Exception: ', ''));
                  }
                },
                child: const Text('Add Lorry'),
              ),
            ],
          );
        },
      ),
    );
  }

  void _confirmDeleteLorry(Lorry lorry) {
    final memos = _memosByLorry[lorry.id] ?? [];
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Delete ${lorry.registrationNumber}?'),
        content: Text(
          memos.isNotEmpty
              ? 'WARNING: This lorry has ${memos.length} saved trip memos!\n\nDeleting this vehicle will permanently delete all associated memos. Do you want to continue?'
              : 'Are you sure you want to delete this lorry folder?',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () async {
              Navigator.pop(ctx);
              await widget.repository.deleteLorry(lorry.id);
              _loadData();
            },
            child: const Text('Delete Permanently', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Lorry Accounts', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            Text('லாரி கணக்கு புத்தகங்கள்', style: TextStyle(fontSize: 11)),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _lorries.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.folder_open, size: 64, color: Colors.grey),
                      const SizedBox(height: 12),
                      const Text('No lorries registered yet.'),
                      const SizedBox(height: 8),
                      ElevatedButton.icon(
                        icon: const Icon(Icons.add),
                        label: const Text('Add Lorry'),
                        onPressed: _showAddLorryDialog,
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: _lorries.length,
                  itemBuilder: (context, index) {
                    final lorry = _lorries[index];
                    final memos = _memosByLorry[lorry.id] ?? [];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      elevation: 1,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: ListTile(
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        leading: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.blue.shade50,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.folder, color: Colors.blue, size: 28),
                        ),
                        title: Text(
                          lorry.registrationNumber,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (lorry.nickname != null && lorry.nickname!.isNotEmpty)
                              Text(lorry.nickname!, style: TextStyle(color: Colors.grey.shade700, fontSize: 12)),
                            Text('${memos.length} Trips Recorded', style: TextStyle(color: Colors.grey.shade500, fontSize: 11)),
                          ],
                        ),
                        trailing: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            IconButton(
                              icon: const Icon(Icons.delete_outline, color: Colors.grey),
                              onPressed: () => _confirmDeleteLorry(lorry),
                            ),
                            const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.grey),
                          ],
                        ),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => MemoListScreen(
                                lorry: lorry,
                                repository: widget.repository,
                              ),
                            ),
                          ).then((_) => _loadData());
                        },
                      ),
                    );
                  },
                ),
      floatingActionButton: FloatingActionButton.extended(
        icon: const Icon(Icons.add),
        label: const Text('Add Lorry'),
        onPressed: _showAddLorryDialog,
      ),
    );
  }
}

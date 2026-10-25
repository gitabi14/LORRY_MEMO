import 'package:flutter/material.dart';
import 'services/app_repository.dart';
import 'screens/lorry_folders_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final repository = AppRepository();
  runApp(LorryMemoApp(repository: repository));
}

class LorryMemoApp extends StatelessWidget {
  final AppRepository repository;

  const LorryMemoApp({super.key, required this.repository});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Lorry Memo & Accounts',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1E3A8A), // Blue theme
          brightness: Brightness.light,
        ),
        appBarTheme: const AppBarTheme(
          centerTitle: false,
          elevation: 0,
          backgroundColor: Color(0xFF0F172A), // Slate 900
          foregroundColor: Colors.white,
        ),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
      ),
      home: LorryFoldersScreen(repository: repository),
    );
  }
}

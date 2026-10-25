class Lorry {
  final String id;
  final String registrationNumber;
  final String? nickname;
  final DateTime createdAt;
  final DateTime updatedAt;

  Lorry({
    required this.id,
    required this.registrationNumber,
    this.nickname,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Lorry.fromJson(Map<String, dynamic> json) {
    return Lorry(
      id: json['id'] as String,
      registrationNumber: (json['registration_number'] as String).toUpperCase(),
      nickname: json['nickname'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'registration_number': registrationNumber,
      'nickname': nickname,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

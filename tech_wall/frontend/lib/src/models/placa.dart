import 'package:tech_wall/src/models/material_placa.dart';

class Placa {
  final int id;
  final String nome;
  final String? descricao;
  final double? altura;
  final double? largura;
  final double? espessura;
  final String? tipoTrama;
  final int qtAguardandoProducao;
  final int qtEmProducao;
  final int qtPronta;
  final List<MaterialPlaca> materiais;

  Placa({
    required this.id,
    required this.nome,
    this.descricao,
    this.altura,
    this.largura,
    this.espessura,
    this.tipoTrama,
    required this.qtAguardandoProducao,
    required this.qtEmProducao,
    required this.qtPronta,
    this.materiais = const [],
  });

  factory Placa.fromJson(Map<String, dynamic> json) {
    return Placa(
      id: json['id'],
      nome: json['nome'],
      descricao: json['descricao'],
      altura: double.tryParse(json['altura']?.toString() ?? ''),
      largura: double.tryParse(json['largura']?.toString() ?? ''),
      espessura: double.tryParse(json['espessura']?.toString() ?? ''),
      tipoTrama: json['tipo_trama'],
      qtAguardandoProducao: json['qt_aguardando_producao'] ?? 0,
      qtEmProducao: json['qt_em_producao'] ?? 0,
      qtPronta: json['qt_pronta'] ?? 0,
      materiais: (json['materiais_placa'] as List?)
              ?.map((e) => MaterialPlaca.fromJson(e))
              .toList() ??
          [],
    );
  }
}

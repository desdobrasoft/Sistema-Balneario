import 'dart:convert' show jsonEncode;

enum TipoMovimentacao {
  entrada('I'),
  saida('O');

  final String tipo;

  const TipoMovimentacao(this.tipo);
}

class CreateMovimentacaoDto {
  final String materialId;
  final TipoMovimentacao tipoMovimentacao;
  final String dataMovimentacao;
  final int qtde;
  final String? fornecedor;
  final String? notas;

  const CreateMovimentacaoDto({
    required this.materialId,
    required this.tipoMovimentacao,
    required this.dataMovimentacao,
    required this.qtde,
    this.fornecedor,
    this.notas,
  });

  Map<String, Object?> toMap() => {
    'materialId': materialId,
    'tipo_movimentacao': tipoMovimentacao.tipo,
    'data_movimentacao': dataMovimentacao,
    'qtde': qtde,
    if (fornecedor?.isNotEmpty == true) 'fornecedor': fornecedor,
    if (notas?.isNotEmpty == true) 'notas': notas,
  };

  @override
  String toString() => jsonEncode(toMap());
}

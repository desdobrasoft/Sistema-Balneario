import 'dart:convert' show JsonEncoder;

class CreatePedidoDto {
  final String materialId;
  final int qtSolicitada;
  final String? fornecedor;
  final double? valorUnitario;

  const CreatePedidoDto({
    required this.materialId,
    required this.qtSolicitada,
    this.fornecedor,
    this.valorUnitario,
  });

  Map<String, dynamic> toMap() => {
    'materialId': materialId,
    'qt_solicitada': qtSolicitada,
    if (fornecedor != null) 'fornecedor': fornecedor,
    if (valorUnitario != null) 'valor_unitario': valorUnitario,
  };

  @override
  String toString() => JsonEncoder.withIndent('  ').convert(toMap());
}

enum StatusRecebimento { entregue, entregueComAlteracao }

class ReceberPedidoDto {
  final StatusRecebimento status;
  final int? qtEntregue;

  const ReceberPedidoDto({required this.status, this.qtEntregue});

  Map<String, dynamic> toMap() => {
    'status': status == StatusRecebimento.entregue
        ? 'ENTREGUE'
        : 'ENTREGUE_COM_ALTERACAO',
    if (qtEntregue != null) 'qt_entregue': qtEntregue,
  };

  @override
  String toString() => JsonEncoder.withIndent('  ').convert(toMap());
}

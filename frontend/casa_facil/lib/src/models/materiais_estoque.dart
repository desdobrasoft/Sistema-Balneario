import 'dart:convert' show jsonEncode;

class MateriaisEstoque {
  final String id;
  final String nome;
  final int qtEstoque;
  final int limBaixoEstoque;
  final String? ultimaEntrada;
  final String? ultimaSaida;

  const MateriaisEstoque({
    required this.id,
    required this.nome,
    required this.qtEstoque,
    required this.limBaixoEstoque,
    this.ultimaEntrada,
    this.ultimaSaida,
  });

  factory MateriaisEstoque.fromJson(Map? json) {
    return MateriaisEstoque(
      id: json?[_Keys.id],
      nome: json?[_Keys.nome],
      qtEstoque: json?[_Keys.qtEstoque],
      limBaixoEstoque: json?[_Keys.limBaixoEstoque],
      ultimaEntrada: json?[_Keys.ultimaEntrada],
      ultimaSaida: json?[_Keys.ultimaSaida],
    );
  }

  Map<String, Object?> toMap() => {
    _Keys.id: id,
    _Keys.nome: nome,
    _Keys.qtEstoque: qtEstoque,
    _Keys.limBaixoEstoque: limBaixoEstoque,
    _Keys.ultimaEntrada: ultimaEntrada,
    _Keys.ultimaSaida: ultimaSaida,
  };

  @override
  String toString() => jsonEncode(toMap());
}

class _Keys {
  const _Keys._();

  static const id = 'id';
  static const nome = 'nome';
  static const qtEstoque = 'qt_estoque';
  static const limBaixoEstoque = 'lim_baixo_estoque';
  static const ultimaEntrada = 'ultima_entrada';
  static const ultimaSaida = 'ultima_saida';
}

import 'package:tech_wall/src/models/placa.dart';

class PlacasNecessariasModelo {
  final int qtPlaca;
  final Placa placa;

  const PlacasNecessariasModelo({required this.placa, required this.qtPlaca});

  factory PlacasNecessariasModelo.fromJson(Map? json) {
    return PlacasNecessariasModelo(
      placa: Placa.fromJson(json?[_Keys.placa]),
      qtPlaca: json?[_Keys.qtPlaca],
    );
  }
}

abstract class _Keys {
  const _Keys._();

  static const qtPlaca = 'qt_placa';
  static const placa = 'placas';
}

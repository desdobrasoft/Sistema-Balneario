import 'package:dio/dio.dart';
import 'package:tech_wall/src/api/placas/dto.dart';
import 'package:tech_wall/src/components/dialogs/error.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/placa.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/services/env/env.dart';
import 'package:tech_wall/src/services/http/service.dart';

class PlacasApi {
  const PlacasApi._();

  static final _http = HttpService.instance;
  static final _url = EnvManager.env.placas;

  static Future<List<Placa>> listAll() async {
    try {
      final response = await _http.dio.get(_url);
      return (response.data as List).map((p) => Placa.fromJson(p)).toList();
    } on DioException catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(
          message: defaultErrorMessage,
          detalhes: e.response?.data.toString(),
        ),
      );
      return [];
    }
  }

  static Future<bool> create(CreatePlacaDto dto) async {
    try {
      await _http.dio.post(_url, data: dto.toMap());
      return true;
    } on DioException catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(
          message: defaultErrorMessage,
          detalhes: e.response?.data.toString(),
        ),
        ignoreOpenDialog: true,
      );
      return false;
    }
  }

  static Future<bool> update(int id, UpdatePlacaDto dto) async {
    try {
      await _http.dio.patch('$_url/$id', data: dto.toMap());
      return true;
    } on DioException catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(
          message: defaultErrorMessage,
          detalhes: e.response?.data.toString(),
        ),
        ignoreOpenDialog: true,
      );
      return false;
    }
  }

  static Future<bool> remove(int id) async {
    try {
      await _http.dio.delete('$_url/$id');
      return true;
    } on DioException catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(
          message: defaultErrorMessage,
          detalhes: e.response?.data.toString(),
        ),
        ignoreOpenDialog: true,
      );
      return false;
    }
  }

  static Future<bool> gerenciarProducao(
    int id,
    GerenciarProducaoPlacaDto dto,
  ) async {
    try {
      await _http.dio.post('$_url/$id/gerenciar-producao', data: dto.toMap());
      return true;
    } on DioException catch (e) {
      try {
        DialogService.instance.showDialog(
          ErrorDialog(message: e.response?.data['message']),
          ignoreOpenDialog: true,
        );
      } catch (_) {
        DialogService.instance.showDialog(
          ErrorDialog(
            message: defaultErrorMessage,
            detalhes: e.response?.data.toString(),
          ),
          ignoreOpenDialog: true,
        );
      }
      return false;
    }
  }

  static Future<bool> baixaProducao(int id, BaixaProducaoPlacaDto dto) async {
    try {
      await _http.dio.post('$_url/$id/baixa-producao', data: dto.toMap());
      return true;
    } on DioException catch (e) {
      try {
        DialogService.instance.showDialog(
          ErrorDialog(message: e.response?.data['message']),
          ignoreOpenDialog: true,
        );
      } catch (_) {
        DialogService.instance.showDialog(
          ErrorDialog(
            message: defaultErrorMessage,
            detalhes: e.response?.data.toString(),
          ),
          ignoreOpenDialog: true,
        );
      }
      return false;
    }
  }
}
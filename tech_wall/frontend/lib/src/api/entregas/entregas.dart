import 'package:dio/dio.dart';
import 'package:tech_wall/src/api/entregas/dto.dart';
import 'package:tech_wall/src/components/dialogs/error.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/entrega.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/services/env/env.dart';
import 'package:tech_wall/src/services/http/service.dart';

class EntregasApi {
  const EntregasApi._();

  static final _http = HttpService.instance;
  static final _env = EnvManager.env;
  static final _url = _env.entregas;

  /// Lista todas as entregas.
  static Future<List<EntregaModel>> listAll() async {
    try {
      final response = await _http.dio.get(_url);
      final json = response.data;
      return (json as List).map((e) => EntregaModel.fromJson(e)).toList();
    } on DioException catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(
          message: defaultErrorMessage,
          detalhes: e.response?.data.toString(),
        ),
      );
      return [];
    } catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: e.toString()),
      );
      return [];
    }
  }

  /// Atualiza os dados de uma entrega.
  static Future<bool> update(int id, UpdateEntregaDto dto) async {
    try {
      await _http.dio.patch('$_url/$id', data: dto.toMap());
      return true;
    } on DioException catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(
          message: defaultErrorMessage,
          detalhes: e.response?.data.toString(),
        ),
      );
      return false;
    } catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: e.toString()),
      );
      return false;
    }
  }
}

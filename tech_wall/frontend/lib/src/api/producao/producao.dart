import 'package:dio/dio.dart';
import 'package:tech_wall/src/api/producao/dto.dart';
import 'package:tech_wall/src/components/dialogs/error.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/ordem_producao.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/services/env/env.dart';
import 'package:tech_wall/src/services/http/service.dart';

class ProducaoApi {
  const ProducaoApi._();

  static final _http = HttpService.instance;
  static final _url = EnvManager.env.producao;

  static Future<List<OrdemProducaoModel>> listAll() async {
    try {
      final response = await _http.dio.get(_url);
      return (response.data as List)
          .map((p) => OrdemProducaoModel.fromJson(p))
          .toList();
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

  static Future<bool> updateStatus(int id, UpdateOrdemProducaoDto dto) async {
    try {
      await _http.dio.patch('$_url/$id', data: dto.toMap());
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

  static Future<bool> createInternalOrder(CreateInternalOrderDto dto) async {
    try {
      await _http.dio.post('$_url/internal-order', data: dto.toMap());
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

  static Future<bool> finalizarProducao(int id) async {
    try {
      await _http.dio.post('$_url/$id/finalizar');
      return true;
    } on DioException catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(
          message: e.response?.data?['message'] ?? defaultErrorMessage,
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
}

import 'package:dio/dio.dart';
import 'package:tech_wall/src/api/producao/dto.dart';
import 'package:tech_wall/src/components/dialogs/error.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/ordem_producao.dart'; // Renomeei o modelo para consistência
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/services/env/env.dart';
import 'package:tech_wall/src/services/http/service.dart';
import 'package:tech_wall/src/utils/build_url.dart';

class ProducaoApi {
  const ProducaoApi._();

  static final _env = EnvManager.env;
  static final _http = HttpService.instance;
  static final _url = _env.producao;

  /// Lista todas as ordens de produção.
  static Future<List<OrdemProducaoModel>> listAll() async {
    try {
      final response = await _http.dio.get(buildUrl(_url));

      // O Dio já verifica o status code, então aqui só tratamos o sucesso
      final json = response.data;
      return (json as List).map((p) => OrdemProducaoModel.fromJson(p)).toList();
    } on DioException catch (e) {
      // Trata erros de rede ou de status (4xx, 5xx)
      DialogService.instance.showDialog(
        ErrorDialog(
          message: defaultErrorMessage,
          detalhes: e.response?.data.toString(),
        ),
      );
      return [];
    } catch (e) {
      // Trata outros erros inesperados (ex: parsing)
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: e.toString()),
      );
      return [];
    }
  }

  /// Atualiza o status de uma ordem de produção.
  static Future<bool> update(int id, UpdateOrdemProducaoDto dto) async {
    try {
      await _http.dio.patch(buildUrl('$_url/$id'), data: dto.toMap());
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

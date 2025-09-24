import 'package:dio/dio.dart';
import 'package:tech_wall/src/api/movimentacoes_materiais/dto.dart';
import 'package:tech_wall/src/components/dialogs/error.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/services/env/env.dart';
import 'package:tech_wall/src/services/http/service.dart';
import 'package:tech_wall/src/utils/build_url.dart';

class MovimentacoesApi {
  const MovimentacoesApi._();

  static final _http = HttpService.instance;
  static final _env = EnvManager.env;
  static final _url = _env.movimentacoesMateriais;

  /// Cria um novo registro de movimentação de material.
  static Future<bool> create(CreateMovimentacaoDto dto) async {
    try {
      await _http.dio.post(buildUrl(_url), data: dto.toMap());
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

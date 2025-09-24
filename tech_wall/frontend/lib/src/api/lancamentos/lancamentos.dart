import 'package:dio/dio.dart';
import 'package:tech_wall/src/api/lancamentos/dto.dart';
import 'package:tech_wall/src/components/dialogs/error.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/lancamento.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/services/env/env.dart';
import 'package:tech_wall/src/services/http/service.dart';
import 'package:tech_wall/src/utils/build_url.dart';

class LancamentosApi {
  const LancamentosApi._();

  static final _http = HttpService.instance;
  static final _env = EnvManager.env;
  static final _url = _env.lancamentos;

  /// Cria um novo lançamento financeiro.
  static Future<bool> create(CreateLancamentoDto dto) async {
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

  /// Lista todos os lançamentos financeiros.
  static Future<List<LancamentoModel>> listAll() async {
    try {
      final response = await _http.dio.get(buildUrl(_url));
      final json = response.data;
      return (json as List).map((l) => LancamentoModel.fromJson(l)).toList();
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

  /// Atualiza um lançamento financeiro (ex: registrar um pagamento).
  static Future<bool> update(int id, UpdateLancamentoDto dto) async {
    try {
      await _http.dio.patch(buildUrl('$_url/$id'), data: dto.toMap());
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
    } catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: e.toString()),
        ignoreOpenDialog: true,
      );
      return false;
    }
  }

  /// Remove um lançamento financeiro.
  static Future<bool> remove(int id) async {
    try {
      await _http.dio.delete(buildUrl('$_url/$id'));
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

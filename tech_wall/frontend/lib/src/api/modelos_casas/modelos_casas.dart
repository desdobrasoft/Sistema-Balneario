import 'package:dio/dio.dart';
import 'package:tech_wall/src/api/modelos_casas/dto.dart';
import 'package:tech_wall/src/components/dialogs/boolean.dart';
import 'package:tech_wall/src/components/dialogs/error.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/modelo_casa.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/services/env/env.dart';
import 'package:tech_wall/src/services/http/service.dart';
import 'package:tech_wall/src/utils/build_url.dart';

class ModelosCasasApi {
  const ModelosCasasApi._();

  static final _http = HttpService.instance;
  static final _env = EnvManager.env;
  static final _url = _env.modeloCasa;

  /// Adiciona um novo modelo de casa.
  static Future<bool> addModeloCasa(CreateModeloCasaDto dto) async {
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

  /// Edita um modelo de casa existente.
  static Future<bool> editModeloCasa({
    required int id,
    required UpdateModeloCasaDto dto,
  }) async {
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

  /// Lista todos os modelos de casa ativos.
  static Future<List<ModeloCasaModel>> listAll() async {
    try {
      final response = await _http.dio.get(buildUrl(_url));
      final json = response.data;
      return (json as List).map((m) => ModeloCasaModel.fromJson(m)).toList();
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

  /// Remove um modelo de casa (soft delete).
  static Future<bool> removeModeloCasa(ModeloCasaModel modelo) async {
    final accept =
        await DialogService.instance.showDialog(
          BooleanDialog(
            title: 'Remover Modelo',
            content:
                'Tem certeza que deseja remover o modelo "${modelo.nome}"?',
          ),
        ) ==
        true;

    if (!accept) return false;

    try {
      await _http.dio.delete(buildUrl('$_url/${modelo.id}'));
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

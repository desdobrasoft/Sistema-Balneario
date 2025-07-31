import 'package:casa_facil/src/api/materiais_estoque/dto.dart';
import 'package:casa_facil/src/components/dialogs/boolean.dart';
import 'package:casa_facil/src/components/dialogs/error.dart';
import 'package:casa_facil/src/constants/constants.dart';
import 'package:casa_facil/src/models/materiais_estoque.dart';
import 'package:casa_facil/src/services/dialog/dialog.dart';
import 'package:casa_facil/src/services/env/env.dart';
import 'package:casa_facil/src/services/http/service.dart';
import 'package:casa_facil/src/utils/build_url.dart';
import 'package:dio/dio.dart';

class MateriaisEstoqueApi {
  const MateriaisEstoqueApi._();

  static final _http = HttpService.instance;
  static final _env = EnvManager.env;
  static final _url = _env.materiais;

  /// Cria um novo material no estoque.
  static Future<bool> addMaterial(CreateMaterialDto dto) async {
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

  /// Lista todos os materiais ativos no estoque.
  static Future<List<MateriaisEstoque>> listAll() async {
    try {
      final response = await _http.dio.get(buildUrl(_url));
      final json = response.data;
      return (json as List).map((m) => MateriaisEstoque.fromJson(m)).toList();
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

  /// Busca um único material pelo seu ID.
  static Future<MateriaisEstoque?> getMaterial(String id) async {
    try {
      final response = await _http.dio.get(buildUrl('$_url/$id'));
      return MateriaisEstoque.fromJson(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode != 404) {
        DialogService.instance.showDialog(
          ErrorDialog(
            message: defaultErrorMessage,
            detalhes: e.response?.data.toString(),
          ),
        );
      }
      return null;
    } catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: e.toString()),
      );
      return null;
    }
  }

  /// Atualiza os dados de um material existente.
  static Future<bool> editMaterial({
    required String id,
    required UpdateMaterialDto dto,
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

  /// Remove um material do estoque (soft delete).
  static Future<bool> removeMaterial(MateriaisEstoque material) async {
    final accept =
        await DialogService.instance.showDialog(
          BooleanDialog(
            title: 'Remover Material',
            content:
                'Tem certeza que deseja remover o material "${material.nome}"?',
          ),
        ) ==
        true;

    if (!accept) return false;

    try {
      await _http.dio.delete(buildUrl('$_url/${material.id}'));
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

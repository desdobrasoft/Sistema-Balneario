import 'package:dio/dio.dart';
import 'package:tech_wall/src/api/clientes/dto.dart';
import 'package:tech_wall/src/components/dialogs/boolean.dart';
import 'package:tech_wall/src/components/dialogs/error.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/cliente.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/services/env/env.dart';
import 'package:tech_wall/src/services/http/service.dart';
import 'package:tech_wall/src/utils/build_url.dart';

class ClientesApi {
  const ClientesApi._();

  static final _http = HttpService.instance;
  static final _env = EnvManager.env;
  static final _url = _env.clientes;

  /// Adiciona um novo cliente.
  static Future<bool> addCliente(CreateClienteDto dto) async {
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

  /// Edita um cliente existente.
  static Future<bool> editCliente({
    required int id,
    required UpdateClienteDto dto,
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

  /// Lista todos os clientes.
  static Future<List<ClienteModel>> listAll() async {
    try {
      final response = await _http.dio.get(buildUrl(_url));
      final json = response.data;
      return (json as List).map((c) => ClienteModel.fromJson(c)).toList();
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

  /// Remove um cliente.
  static Future<bool> removeCliente(ClienteModel cliente) async {
    final accept =
        await DialogService.instance.showDialog(
          BooleanDialog(
            title: 'Remover Cliente',
            content:
                'Tem certeza que deseja remover o cliente "${cliente.nome}"?',
          ),
        ) ==
        true;

    if (!accept) return false;

    try {
      await _http.dio.delete(buildUrl('$_url/${cliente.id}'));
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

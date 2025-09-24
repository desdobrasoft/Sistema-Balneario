import 'package:dio/dio.dart';
import 'package:tech_wall/src/api/vendas/dto.dart';
import 'package:tech_wall/src/components/dialogs/error.dart';
import 'package:tech_wall/src/constants/constants.dart'
    show defaultErrorMessage;
import 'package:tech_wall/src/models/venda.dart';
import 'package:tech_wall/src/models/venda_item_override.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/services/env/env.dart';
import 'package:tech_wall/src/services/http/service.dart';
import 'package:tech_wall/src/utils/build_url.dart';

class VendasApi {
  const VendasApi._();

  static final _http = HttpService.instance;
  static final _env = EnvManager.env;
  static final _url = _env.vendas;

  /// Cria um novo registro de venda usando um DTO.
  /// Retorna o [VendaModel] criado em caso de sucesso, ou nulo em caso de falha.
  static Future<VendaModel?> addVenda(CreateVendaDto dto) async {
    try {
      final response = await _http.dio.post(buildUrl(_url), data: dto.toMap());
      return VendaModel.fromJson(response.data);
    } on DioException catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(
          message: defaultErrorMessage,
          detalhes: e.response?.data.toString(),
        ),
      );
      return null;
    } catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: e.toString()),
      );
      return null;
    }
  }

  /// Lista todas as vendas registradas.
  static Future<List<VendaModel>> listAll({String? excludeStatus}) async {
    try {
      final queryParams = <String, String>{};
      if (excludeStatus != null) {
        queryParams['exclude_status'] = excludeStatus;
      }

      final response = await _http.dio.get(
        buildUrl(_url),
        queryParameters: queryParams,
      );
      final json = response.data;
      return (json as List).map((v) => VendaModel.fromJson(v)).toList();
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

  /// Atualiza o status de uma venda (produção ou pagamento) usando um DTO.
  static Future<bool> updateVenda({
    required int vendaId,
    required UpdateVendaDto dto,
  }) async {
    try {
      await _http.dio.patch(buildUrl('$_url/$vendaId'), data: dto.toMap());
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

  /// Busca os itens customizados de uma venda.
  static Future<List<VendaItemOverride>> getCustomization(int vendaId) async {
    try {
      final response = await _http.dio.get(
        buildUrl('$_url/$vendaId/customization'),
      );
      final json = response.data;
      return (json as List).map((v) => VendaItemOverride.fromJson(v)).toList();
    } catch (e) {
      // Não mostra dialog de erro, pois a ausência de customização não é um erro.
      return [];
    }
  }
}

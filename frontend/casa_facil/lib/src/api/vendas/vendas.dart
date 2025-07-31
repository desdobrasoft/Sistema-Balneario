import 'package:casa_facil/src/api/vendas/dto.dart';
import 'package:casa_facil/src/components/dialogs/error.dart';
import 'package:casa_facil/src/constants/constants.dart'
    show defaultErrorMessage;
import 'package:casa_facil/src/models/venda.dart';
import 'package:casa_facil/src/services/dialog/dialog.dart';
import 'package:casa_facil/src/services/env/env.dart';
import 'package:casa_facil/src/services/http/service.dart';
import 'package:casa_facil/src/utils/build_url.dart';
import 'package:dio/dio.dart';

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
  static Future<List<VendaModel>> listAll() async {
    try {
      final response = await _http.dio.get(buildUrl(_url));
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
}

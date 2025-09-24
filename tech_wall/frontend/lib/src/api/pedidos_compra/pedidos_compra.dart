import 'package:dio/dio.dart';
import 'package:tech_wall/src/api/pedidos_compra/dto.dart';
import 'package:tech_wall/src/components/dialogs/error.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/models/pedido_compra.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/services/env/env.dart';
import 'package:tech_wall/src/services/http/service.dart';
import 'package:tech_wall/src/utils/build_url.dart';

class PedidosCompraApi {
  const PedidosCompraApi._();

  static final _http = HttpService.instance;
  static final _env = EnvManager.env;
  static final _url = _env.pedidosCompra;

  static Future<bool> create(CreatePedidoDto dto) async {
    try {
      await _http.dio.post(buildUrl(_url), data: dto.toMap());
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

  static Future<List<PedidoCompraModel>> listAll() async {
    try {
      final response = await _http.dio.get(buildUrl(_url));
      return (response.data as List)
          .map((p) => PedidoCompraModel.fromJson(p))
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

  static Future<bool> receber(int id, ReceberPedidoDto dto) async {
    try {
      await _http.dio.patch(
        buildUrl('$_url/$id${_env.compraReceber}'),
        data: dto.toMap(),
      );
      return true;
    } on DioException catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(
          message: defaultErrorMessage,
          detalhes: e.response?.data.toString(),
        ),
      );
      return false;
    }
  }

  static Future<bool> resolver(int id) async {
    try {
      await _http.dio.patch(buildUrl('$_url/$id${_env.compraResolver}'));
      return true;
    } on DioException catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(
          message: defaultErrorMessage,
          detalhes: e.response?.data.toString(),
        ),
      );
      return false;
    }
  }
}

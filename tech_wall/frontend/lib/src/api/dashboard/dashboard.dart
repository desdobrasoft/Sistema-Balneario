import 'package:dio/dio.dart';
import 'package:tech_wall/src/components/dialogs/error.dart';
import 'package:tech_wall/src/constants/constants.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/services/env/env.dart';
import 'package:tech_wall/src/services/http/service.dart';

class DashboardApi {
  const DashboardApi._();

  static final _env = EnvManager.env;
  static final _http = HttpService.instance;

  static Future<Map<String, dynamic>> getAvgDeliveryTime() async {
    try {
      final response = await _http.dio.get(_env.tempoMedio);
      return response.data;
    } on DioException catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(
          message: defaultErrorMessage,
          detalhes: e.response?.data.toString(),
        ),
      );
      return {'avgDays': 0};
    } catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: e.toString()),
      );
      return {'avgDays': 0};
    }
  }

  static Future<Map<String, dynamic>> getDeliveryTimeAnalysis() async {
    try {
      final response = await _http.dio.get(_env.analiseEntrega);
      return response.data;
    } on DioException catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(
          message: defaultErrorMessage,
          detalhes: e.response?.data.toString(),
        ),
      );
      return {};
    } catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: e.toString()),
      );
      return {};
    }
  }
}

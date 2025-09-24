import 'package:tech_wall/src/components/dialogs/error.dart';
import 'package:tech_wall/src/constants/constants.dart'
    show defaultErrorMessage;
import 'package:tech_wall/src/models/tipo_material.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/services/env/env.dart';
import 'package:tech_wall/src/services/http/service.dart';
import 'package:tech_wall/src/utils/build_url.dart';

class TiposMateriaisApi {
  const TiposMateriaisApi._();

  static final _http = HttpService.instance;
  static final _env = EnvManager.env;
  static final _url = _env.tiposMateriais;

  static Future<List<TipoMaterialModel>> listAll() async {
    try {
      final response = await _http.dio.get(buildUrl(_url));
      return (response.data as List)
          .map((e) => TipoMaterialModel.fromJson(e))
          .toList();
    } catch (e) {
      DialogService.instance.showDialog(
        ErrorDialog(message: defaultErrorMessage, detalhes: e.toString()),
      );
      return [];
    }
  }
}

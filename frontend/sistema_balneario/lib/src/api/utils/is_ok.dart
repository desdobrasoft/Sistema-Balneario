import 'package:http/http.dart' show Response;

bool isOk(Response response) {
  return response.statusCode >= 200 && response.statusCode < 300;
}

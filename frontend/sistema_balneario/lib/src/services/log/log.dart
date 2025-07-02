import 'package:flutter/foundation.dart' show debugPrint;

class LogService {
  LogService._();

  static final log = LogService._();

  void e({String? tag, String? subTag, Object? e}) {
    debugPrint(
      '${tag == null ? '' : '{$tag} '}'
      '${subTag == null ? '' : '{$subTag} '}'
      '{$e}',
    );
  }

  Future<void> setUpLogs() async {}
}

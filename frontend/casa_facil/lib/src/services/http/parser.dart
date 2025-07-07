import 'dart:async';
import 'dart:convert' show Utf8Encoder;

import 'package:casa_facil/src/constants/constants.dart'
    show defaultErrorMessage;
import 'package:casa_facil/src/services/log/log.dart';
import 'package:http/http.dart' show Response, delete, get, patch, post;

class HttpParser {
  const HttpParser._();

  static const String _logTag = 'HttpParser';
  static const _requestTimeout = 5;

  static final _log = LogService.log;

  static Future<Response> parse({
    HttpMethod method = HttpMethod.get,
    required String url,
    Map<String, String>? headers,
    String? body,
  }) async {
    Response response;
    try {
      switch (method) {
        case HttpMethod.delete:
          response = await delete(
            Uri.parse(url),
            headers: headers,
            body: body,
          ).timeout(Duration(seconds: _requestTimeout));
          break;
        case HttpMethod.get:
          response = await get(
            Uri.parse(url),
            headers: headers,
          ).timeout(Duration(seconds: _requestTimeout));
          break;
        case HttpMethod.patch:
          response = await patch(
            Uri.parse(url),
            headers: headers,
            body: body,
          ).timeout(Duration(seconds: _requestTimeout));
          break;
        case HttpMethod.post:
          response = await post(
            Uri.parse(url),
            headers: headers,
            body: body,
          ).timeout(Duration(seconds: _requestTimeout));
          break;
      }
    } catch (e) {
      _log.e(tag: _logTag, subTag: 'parse', e: e);
      if (e is TimeoutException) {
        response = Response.bytes(
          const Utf8Encoder().convert(
            '{'
            '"status": false,'
            '"message": "A conexão expirou",'
            '"detail": "O servidor demorou muito para responder. A conexão expirou após ${e.duration?.inSeconds ?? _requestTimeout} segundos"'
            '}',
          ),
          408,
          reasonPhrase: 'Request Timeout',
        );
      } else {
        response = Response.bytes(
          const Utf8Encoder().convert(
            '{'
            '"status": false,'
            '"message": "$defaultErrorMessage",'
            '"detail": "Request: {$url}${body == null ? '' : '  {$body}'}  {$e}"'
            '}',
          ),
          500,
          reasonPhrase: 'Internal Error',
        );
      }
    }
    return response;
  }
}

enum HttpMethod { delete, get, patch, post }

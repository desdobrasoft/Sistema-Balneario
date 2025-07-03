import 'dart:convert' show jsonDecode, jsonEncode;

import 'package:casa_facil/src/services/log/log.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class Preferences with ChangeNotifier {
  Preferences._(this._storage);

  static const _key = 'casa_facil_prefs';
  static const _logTag = 'Preferences';

  static const _macOsOptions = MacOsOptions(groupId: 'casa_facil_prefs');
  static const _webOptions = WebOptions(
    dbName: 'casa_facil_prefs',
    publicKey: 'casa_facil_storage',
  );
  static const _windowsOptions = WindowsOptions();

  final FlutterSecureStorage _storage;

  String? _authToken = _Defaults.authToken;

  static final instance = Preferences._(
    FlutterSecureStorage(
      mOptions: _macOsOptions,
      webOptions: _webOptions,
      wOptions: _windowsOptions,
    ),
  );

  String? get authToken => _authToken;

  Future<void> load() async {
    try {
      if (!(await _storage.containsKey(key: _key))) return;

      final prefs = await _storage.read(key: _key);
      if (prefs == null) return;

      final json = jsonDecode(prefs);

      _authToken = json[PrefEntry.authToken.key] ?? _authToken;

      notifyListeners();
    } catch (e) {
      LogService.log.e(tag: _logTag, subTag: 'load', e: e);
    }
  }

  Future<void> save({String? authToken}) async {
    try {
      authToken ??= _authToken;

      final prefs = jsonEncode({PrefEntry.authToken.key: authToken});

      await _storage.write(key: _key, value: prefs);

      _authToken = authToken;

      notifyListeners();
    } catch (e) {
      LogService.log.e(tag: _logTag, subTag: 'save', e: e);
    }
  }

  Future<void> remove(PrefEntry entry) async {
    await _storage.delete(key: entry.key);

    switch (entry) {
      case PrefEntry.authToken:
        _authToken = _Defaults.authToken;
    }
  }
}

enum PrefEntry {
  authToken('access_token');

  final String key;

  const PrefEntry(this.key);
}

class _Defaults {
  const _Defaults._();

  static const authToken = null;
}

import 'dart:convert' show jsonDecode, jsonEncode;

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:tech_wall/src/services/log/log.dart';

class Preferences with ChangeNotifier {
  Preferences._(this._storage);

  static const _key = 'tech_wall_prefs';
  static const _logTag = 'Preferences';

  final SharedPreferencesAsync _storage;

  String? _authToken = PrefEntry.authToken.dflt;
  String? _refreshToken = PrefEntry.refreshToken.dflt;

  static final instance = Preferences._(SharedPreferencesAsync());

  String? get authToken => _authToken;
  String? get refreshToken => _refreshToken;

  Future<void> load() async {
    try {
      if (!(await _storage.containsKey(_key))) return;

      final prefs = await _storage.getString(_key);
      if (prefs == null) return;

      final json = jsonDecode(prefs);

      _authToken = json[PrefEntry.authToken.key] ?? _authToken;
      _refreshToken = json[PrefEntry.refreshToken.key] ?? _refreshToken;

      notifyListeners();
    } catch (e) {
      LogService.log.e(tag: _logTag, subTag: 'load', e: e);
    }
  }

  Future<void> save({String? authToken, String? refreshToken}) async {
    try {
      authToken ??= _authToken;
      refreshToken ??= _refreshToken;

      final prefs = jsonEncode({
        PrefEntry.authToken.key: authToken,
        PrefEntry.refreshToken.key: refreshToken,
      });

      await _storage.setString(_key, prefs);

      _authToken = authToken;
      _refreshToken = refreshToken;

      notifyListeners();
    } catch (e) {
      LogService.log.e(tag: _logTag, subTag: 'save', e: e);
    }
  }

  Future<void> remove(PrefEntry entry) async {
    try {
      if (!(await _storage.containsKey(_key))) return;

      final prefs = await _storage.getString(_key);
      if (prefs == null) return;

      final json = jsonDecode(prefs);

      json[entry.key] = entry.dflt;

      await _storage.setString(_key, jsonEncode(json));

      switch (entry) {
        case PrefEntry.authToken:
          _authToken = json[PrefEntry.authToken.key];
          break;
        case PrefEntry.refreshToken:
          _refreshToken = json[PrefEntry.refreshToken.key];
          break;
      }

      notifyListeners();
    } catch (e) {
      LogService.log.e(tag: _logTag, subTag: 'remove', e: e);
    }
  }

  Future<void> clear() async {
    try {
      await _storage.clear(allowList: {_key});
    } catch (e) {
      LogService.log.e(tag: _logTag, subTag: 'clear', e: e);
    }
  }
}

enum PrefEntry {
  authToken('access_token', null),
  refreshToken('refresh_token', null);

  final String key;
  final dynamic dflt;

  const PrefEntry(this.key, this.dflt);
}

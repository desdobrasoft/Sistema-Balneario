import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:tech_wall/src/models/placa.dart';
import 'package:tech_wall/src/services/api_service.dart';

class PlacasApi {
  static final _api = ApiService();

  static Future<List<Placa>> listAll() async {
    final response = await _api.get('/placas');
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Placa.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load placas');
    }
  }

  static Future<Placa> create(Map<String, dynamic> data) async {
    final response = await _api.post('/placas', body: jsonEncode(data));
    if (response.statusCode == 201) {
      return Placa.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to create placa');
    }
  }

  static Future<Placa> update(int id, Map<String, dynamic> data) async {
    final response = await _api.patch('/placas/$id', body: jsonEncode(data));
    if (response.statusCode == 200) {
      return Placa.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to update placa');
    }
  }

  static Future<void> remove(int id) async {
    final response = await _api.delete('/placas/$id');
    if (response.statusCode != 200) {
      throw Exception('Failed to delete placa');
    }
  }

  static Future<Placa> gerenciarProducao(
    int id,
    Map<String, dynamic> data,
  ) async {
    final response = await _api.post(
      '/placas/$id/gerenciar-producao',
      body: jsonEncode(data),
    );
    if (response.statusCode == 201) {
      return Placa.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to manage producao');
    }
  }
}

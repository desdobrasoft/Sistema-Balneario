import 'package:flutter/material.dart';
import 'package:intl/intl.dart' show DateFormat;
import 'package:tech_wall/src/api/users/users.dart';
import 'package:tech_wall/src/components/app_button.dart';
import 'package:tech_wall/src/components/card.dart';
import 'package:tech_wall/src/components/dialogs/users/add_user.dart';
import 'package:tech_wall/src/constants/constants.dart'
    show gaplg, gapmd, gapxxl;
import 'package:tech_wall/src/models/user.dart';
import 'package:tech_wall/src/routes/home/usuarios/components/table.dart';
import 'package:tech_wall/src/services/dialog/dialog.dart';
import 'package:tech_wall/src/utils/get_localization.dart';
import 'package:tech_wall/src/utils/hint_style.dart';

class Users extends StatefulWidget {
  const Users({super.key});

  @override
  State<Users> createState() => _UsersState();
}

class _UsersState extends State<Users> {
  final _controller = TextEditingController();
  final _notifier = ValueNotifier(false);

  List<UserModel> _filteredData = [];
  List<UserModel> _origin = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      await _genData();
      _notifier.value = !_notifier.value;
    });
    _controller.addListener(_listener);
  }

  @override
  void dispose() {
    super.dispose();
    _controller.removeListener(_listener);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.all(gapxxl).copyWith(top: 0),
        child: AppCard(
          title: 'Gerenciamento de Usuários',
          subtitle:
              'Visualize, adicione, edite ou remova registros de usuários',
          content: Padding(
            padding: const EdgeInsets.only(top: gapmd),
            child: Column(
              mainAxisSize: MainAxisSize.max,
              children: [
                Row(
                  spacing: gaplg,
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        decoration: InputDecoration(
                          filled: true,
                          hintStyle: hintStyle(context),
                          hintText: 'João da Silva',
                          labelText: 'Buscar usuários',
                          prefixIcon: Icon(Icons.search),
                        ),
                      ),
                    ),
                    AppButton(
                      label: 'Adicionar usuário',
                      onPressed: _addUser,

                      icon: Icon(Icons.add_circle_outline),
                    ),
                  ],
                ),
                Expanded(
                  child: ListenableBuilder(
                    listenable: _notifier,
                    builder: (context, _) {
                      return UsersTable(
                        data: _filteredData,
                        onDataChange: () async {
                          await _genData();
                          _notifier.value = !_notifier.value;
                        },
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _addUser() async {
    await DialogService.instance.showDialog(AddUser());
    await _genData();
    _notifier.value = !_notifier.value;
  }

  Future<void> _genData() async {
    final formatter = DateFormat.yMd(
      localization(context).localeName,
    ).add_Hms();
    _origin = (await UsersApi.listAll()).map((user) {
      final createdDate = DateTime.tryParse(user.createdAt.toString());
      final updatedDate = DateTime.tryParse(user.updatedAt.toString());

      return UserModel(
        createdAt: createdDate == null ? 'N/A' : formatter.format(createdDate),
        email: user.email ?? 'N/A',
        fullName: user.fullName ?? 'N/A',
        id: user.id,
        isActive: user.isActive,
        roles: user.roles,
        updatedAt: updatedDate == null ? 'N/A' : formatter.format(updatedDate),
        username: user.username ?? 'N/A',
      );
    }).toList();
    _filteredData = List.from(_origin);
  }

  void _listener() {
    final text = _controller.text;
    if (text.isEmpty) {
      setState(() {
        _filteredData = _origin;
      });
      return;
    }
    setState(() {
      _filteredData = _origin
          .where(
            (user) =>
                user.username?.contains(text) == true ||
                user.email?.contains(text) == true ||
                user.isActive.toString().contains(text) ||
                user.createdAt?.toString().contains(text) == true ||
                user.updatedAt?.toString().contains(text) == true,
          )
          .toList();
    });
  }
}

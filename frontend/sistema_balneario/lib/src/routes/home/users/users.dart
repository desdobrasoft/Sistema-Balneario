import 'package:flutter/material.dart';
import 'package:sistema_balneario/src/api/users.dart';
import 'package:sistema_balneario/src/components/button.dart';
import 'package:sistema_balneario/src/components/card.dart';
import 'package:sistema_balneario/src/constants/constants.dart'
    show gaplg, gapmd, gapxxl;
import 'package:sistema_balneario/src/models/user.dart';
import 'package:sistema_balneario/src/routes/home/users/components/table.dart';
import 'package:sistema_balneario/src/utils/get_localization.dart';
import 'package:sistema_balneario/src/utils/hint_style.dart';

class Users extends StatefulWidget {
  const Users({super.key});

  @override
  State<Users> createState() => _UsersState();
}

class _UsersState extends State<Users> {
  final _controller = TextEditingController();

  late final List<UserModel> _origin;

  final _notifier = ValueNotifier(false);

  List<UserModel> _filteredData = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      _origin = await UsersApi.listAll();
      _filteredData = List.from(_origin);
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
          title: localization(context).customersCardTitle,
          subtitle: localization(context).customersCardSubtitle,
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
                          hintText: localization(context).customerFilterHint,
                          labelText: localization(context).customerFilterLabel,
                          prefixIcon: Icon(Icons.search),
                        ),
                      ),
                    ),
                    AppButton(
                      label: localization(context).customersAddButtonLabel,
                      onPressed: () {},

                      icon: Icon(Icons.add_circle_outline),
                    ),
                  ],
                ),
                Expanded(
                  child: ListenableBuilder(
                    listenable: _notifier,
                    builder: (context, _) {
                      return UsersTable(data: _filteredData);
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

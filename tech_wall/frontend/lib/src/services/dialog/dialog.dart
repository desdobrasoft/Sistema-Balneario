import 'package:flutter/material.dart' as material;
import 'package:flutter/widgets.dart';
import 'package:tech_wall/src/app.dart';
import 'package:tech_wall/src/components/dialogs/interface.dart';

class DialogService {
  DialogService._();

  bool _isOpen = false;
  bool _isPrioOpen = false;

  static final instance = DialogService._();

  /// Exibe um dos diálogos customizados da aplicação na tela.
  ///
  /// - [dialog]: O diálogo a ser exibido.
  /// - [ignoreOpenDialog]: Se `true`, exibe um novo diálogo em cima de qualquer
  ///   outro diálogo que já esteja aberto (para diálogos prioritários, como
  ///   avisos de erros).
  Future<T?> showDialog<T>(
    DialogInterface dialog, {
    BuildContext? context,
    bool ignoreOpenDialog = false,
  }) async {
    // Obtém o contexto atual através da chave de navegação da aplicação caso
    // não seja passado por parâmetro.
    final ctx = context ?? TechWall.appKey.currentContext;
    if (ctx == null) return null;

    // Se não é um diálogo prioritário, e já existe um diálogo aberto, encerra a
    // execução.
    if (!ignoreOpenDialog && _isOpen) return null;

    // Aciona uma flag que indica se o diálogo está aberto.
    // A diferenciação entre _isOpen e _isPrioOpen é para que, quando um diálogo
    // de prioridade for aberto, ele não desacione a flag global ao ser fechado.
    // Algo semelhante ainda ocorrerá entre múltiplos diálogos de prioridade,
    // mas de qualquer forma uma aplicação não deveria aninhar tantos diálogos
    // de uma só vez.
    if (ignoreOpenDialog) {
      _isPrioOpen = true;
    } else {
      _isOpen = true;
    }

    // Exibe o diálogo, aguarda o diálogo ser encerrado e, assim que dispensado,
    // desaciona a flag que indica que há um diálogo aberto.
    try {
      return await material.showDialog(
        context: ctx,
        builder: (context) => dialog,
      );
    } finally {
      if (ignoreOpenDialog) {
        _isPrioOpen = false;
      } else {
        _isOpen = false;
      }
    }
  }

  /// Se há um dos diálogos controlados por esse serviço aberto.
  bool get isOpen => _isOpen || _isPrioOpen;
}

int compare(Object? a, Object? b, bool ascending) {
  int direction = ascending ? 1 : -1;

  // Ordenar nulos no final (sempre)
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  // Booleanos: true vem antes de false
  if (a is bool && b is bool) {
    return direction * (b ? 1 : 0).compareTo(a ? 1 : 0); // true antes de false
  }

  // Numéricos: int ou double
  if (a is num && b is num) {
    return direction * a.compareTo(b);
  }

  // Strings
  if (a is String && b is String) {
    return direction * a.compareTo(b);
  }

  // Mesmos tipos, mas não suportados acima: tenta usar compareTo se existir
  if (a.runtimeType == b.runtimeType && a is Comparable && b is Comparable) {
    return direction * (a).compareTo(b);
  }

  // Tipos diferentes: define uma ordem arbitrária entre os tipos
  int typeOrder(Object o) {
    if (o is bool) return 0;
    if (o is num) return 1;
    if (o is String) return 2;
    return 3; // outros
  }

  return direction * typeOrder(a).compareTo(typeOrder(b));
}

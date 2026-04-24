export enum DirecaoCorte {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface VetorCorte {
  direcao: DirecaoCorte;
  distancia: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  width: number;
  height: number;
  x: number;
  y: number;
}

export class GeometriaPlaca {
  /**
   * Mescla vetores consecutivos que possuem a mesma direção.
   */
  static simplificarPercurso(percurso: VetorCorte[]): VetorCorte[] {
    if (percurso.length === 0) return [];
    const simplificado: VetorCorte[] = [];
    let atual = { ...percurso[0] };

    for (let i = 1; i < percurso.length; i++) {
      if (percurso[i].direcao === atual.direcao) {
        atual.distancia =
          Number(atual.distancia) + Number(percurso[i].distancia);
      } else {
        simplificado.push(atual);
        atual = { ...percurso[i] };
      }
    }
    simplificado.push(atual);
    return simplificado;
  }

  /**
   * Identifica se um percurso ortogonal fechado descreve um retângulo simples.
   */
  static eRetangulo(percurso: VetorCorte[]): boolean {
    const s = this.simplificarPercurso(percurso);
    // Um retângulo ortogonal fechado deve ter exatamente 4 segmentos (ou 5 se o último for redundante antes de fechar)
    // No nosso sistema, se for fechado e simplificado, deve ter 4.
    if (s.length !== 4) return false;

    const isHorizontal = (d: DirecaoCorte) =>
      d === DirecaoCorte.LEFT || d === DirecaoCorte.RIGHT;

    // Deve alternar entre horizontal e vertical
    if (isHorizontal(s[0].direcao) === isHorizontal(s[1].direcao)) return false;

    // Lados opostos devem ter a mesma distância
    return (
      Number(s[0].distancia) === Number(s[2].distancia) &&
      Number(s[1].distancia) === Number(s[3].distancia)
    );
  }

  /**
   * Converte percurso de vetores em pontos absolutos.
   * Assume que o sistema é Cartesiano: X aumenta para a direita, Y aumenta para CIMA.
   * Vértice inferior esquerdo da placa é (0, 0).
   */
  static percursoParaPontos(origem: Point, percurso: VetorCorte[]): Point[] {
    const pontos: Point[] = [{ ...origem }];
    let currentX = origem.x;
    let currentY = origem.y;

    for (const v of percurso) {
      switch (v.direcao) {
        case DirecaoCorte.UP:
          currentY += v.distancia;
          break;
        case DirecaoCorte.DOWN:
          currentY -= v.distancia;
          break;
        case DirecaoCorte.LEFT:
          currentX -= v.distancia;
          break;
        case DirecaoCorte.RIGHT:
          currentX += v.distancia;
          break;
      }
      pontos.push({ x: currentX, y: currentY });
    }

    return pontos;
  }

  static calcularBoundingBox(pontos: Point[]): Rect {
    if (pontos.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

    let minX = pontos[0].x;
    let maxX = pontos[0].x;
    let minY = pontos[0].y;
    let maxY = pontos[0].y;

    for (const p of pontos) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Verifica se um retângulo cabe dentro de outro (sobra).
   * Permite rotação de 90 graus (se couber virado).
   */
  static cabeNoRetalho(
    peça: { w: number; h: number },
    retalho: { w: number; h: number },
  ): boolean {
    // Normal (mesma orientação)
    if (peça.w <= retalho.w && peça.h <= retalho.h) return true;
    // Rotacionado 90 graus
    if (peça.h <= retalho.w && peça.w <= retalho.h) return true;
    return false;
  }

  /**
   * Algoritmo simplificado de retalhos:
   * Ao retirar um retângulo (bbox) de uma placa original (W, H),
   * gera as sobras retangulares máximas ao redor.
   */
  static calcularRetalhosUteis(
    original: { w: number; h: number },
    corte: Rect,
  ): { width: number; height: number }[] {
    const retalhos: { width: number; height: number }[] = [];

    // Sobra abaixo do corte
    if (corte.y > 0) {
      retalhos.push({ width: original.w, height: corte.y });
    }
    // Sobra acima do corte
    const sobraAcima = original.h - (corte.y + corte.height);
    if (sobraAcima > 0) {
      retalhos.push({ width: original.w, height: sobraAcima });
    }
    // Sobra à esquerda do corte (na faixa de altura do corte)
    if (corte.x > 0) {
      retalhos.push({ width: corte.x, height: corte.height });
    }
    // Sobra à direita do corte (na faixa de altura do corte)
    const sobraDireita = original.w - (corte.x + corte.width);
    if (sobraDireita > 0) {
      retalhos.push({ width: sobraDireita, height: corte.height });
    }

    // Filtrar retalhos muito pequenos (ex: < 5cm)
    return retalhos.filter((r) => r.width >= 5 && r.height >= 5);
  }

  /**
   * Converte pontos em segmentos de linha.
   */
  static pontosParaSegmentos(pontos: Point[]): { p1: Point; p2: Point }[] {
    const segmentos: { p1: Point; p2: Point }[] = [];
    for (let i = 0; i < pontos.length - 1; i++) {
      segmentos.push({ p1: pontos[i], p2: pontos[i + 1] });
    }
    return segmentos;
  }

  /**
   * Verifica se dois segmentos ortogonais se CRUZAM (em forma de X).
   * Exclui casos colineares ou que apenas se tocam.
   */
  static segmentosCruzam(
    s1: { p1: Point; p2: Point },
    s2: { p1: Point; p2: Point },
  ): boolean {
    const isS1Vertical = s1.p1.x === s1.p2.x;
    const isS2Vertical = s2.p1.x === s2.p2.x;

    // Se ambos são paralelos, não há cruzamento em X
    if (isS1Vertical === isS2Vertical) return false;

    const v = isS1Vertical ? s1 : s2;
    const h = isS1Vertical ? s2 : s1;

    const minV = Math.min(v.p1.y, v.p2.y);
    const maxV = Math.max(v.p1.y, v.p2.y);
    const minH = Math.min(h.p1.x, h.p2.x);
    const maxH = Math.max(h.p1.x, h.p2.x);

    // Cruzamento em X (estritamente dentro dos intervalos)
    return h.p1.y > minV && h.p1.y < maxV && v.p1.x > minH && v.p1.x < maxH;
  }

  /**
   * Ponto em Polígono (Ortogonal).
   */
  static pontoNoPoligono(p: Point, poligono: Point[]): boolean {
    let inside = false;
    for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
      const xi = poligono[i].x,
        yi = poligono[i].y;
      const xj = poligono[j].x,
        yj = poligono[j].y;

      const intersect =
        yi > p.y !== yj > p.y &&
        p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /**
   * Verifica se um ponto está exatamente sobre um segmento.
   */
  static pontoEmSegmento(p: Point, s: { p1: Point; p2: Point }): boolean {
    const epsilon = 0.001; // Precisão micrométrica para permitir apenas colinearidade real
    const minX = Math.min(s.p1.x, s.p2.x) - epsilon;
    const maxX = Math.max(s.p1.x, s.p2.x) + epsilon;
    const minY = Math.min(s.p1.y, s.p2.y) - epsilon;
    const maxY = Math.max(s.p1.y, s.p2.y) + epsilon;

    if (p.x < minX || p.x > maxX || p.y < minY || p.y > maxY) return false;

    // Para segmentos ortogonais
    if (s.p1.x === s.p2.x) return Math.abs(p.x - s.p1.x) < epsilon;
    if (s.p1.y === s.p2.y) return Math.abs(p.y - s.p1.y) < epsilon;

    return false;
  }

  /**
   * Verifica se um ponto está na borda de um polígono.
   */
  static pontoNaBorda(p: Point, poligono: Point[]): boolean {
    const segmentos = this.pontosParaSegmentos(poligono);
    return segmentos.some((s) => this.pontoEmSegmento(p, s));
  }

  /**
   * Determina se o polígono foi desenhado em sentido horário.
   * Usando a fórmula da área assinada (Shoelace formula).
   */
  static eSentidoHorario(pontos: Point[]): boolean {
    let area = 0;
    for (let i = 0; i < pontos.length; i++) {
      const p1 = pontos[i];
      const p2 = pontos[(i + 1) % pontos.length];
      area += (p2.x - p1.x) * (p2.y + p1.y);
    }
    return area > 0;
  }

  /**
   * Gera pontos ligeiramente deslocados para o interior de um polígono
   * (um ponto para cada segmento).
   */
  static obterPontosInternos(pontos: Point[]): Point[] {
    if (pontos.length < 3) return [];

    const isCW = this.eSentidoHorario(pontos);
    const epsilon = 0.01; // Deslocamento de 0.1mm para capturar invasões mínimas
    const pontosInternos: Point[] = [];

    const segmentos = this.pontosParaSegmentos(pontos);

    for (const s of segmentos) {
      const dx = s.p2.x - s.p1.x;
      const dy = s.p2.y - s.p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) continue;

      const ux = dx / len;
      const uy = dy / len;

      // Vetor normal interno em Sistema Cartesiano (Y-up):
      // Se CW (area > 0 em nossa formula): Interior está à DIREITA -> (uy, -ux)
      // Se CCW (area < 0 em nossa formula): Interior está à ESQUERDA -> (-uy, ux)
      const nx = isCW ? uy : -uy;
      const ny = isCW ? -ux : ux;

      pontosInternos.push({
        x: (s.p1.x + s.p2.x) / 2 + nx * epsilon,
        y: (s.p1.y + s.p2.y) / 2 + ny * epsilon,
      });
    }

    return pontosInternos;
  }

  /**
   * Detecta se dois cortes se sobrepõem (área maior que zero).
   */
  static detectarSobreposicao(pontos1: Point[], pontos2: Point[]): boolean {
    const segs1 = this.pontosParaSegmentos(pontos1);
    const segs2 = this.pontosParaSegmentos(pontos2);

    // 1. Verificas cruzamentos de segmentos em cruz (X)
    // Se as linhas se cruzam, há sobreposição imediata.
    for (const s1 of segs1) {
      for (const s2 of segs2) {
        if (this.segmentosCruzam(s1, s2)) return true;
      }
    }

    // 2. Verifica invasão de área interna (Amostragem em todos os segmentos)
    // Pegamos pontos "dentro" do polígono 1 e vemos se algum caiu dentro do polígono 2.
    const pontosInternos1 = this.obterPontosInternos(pontos1);
    for (const p of pontosInternos1) {
      if (this.pontoNoPoligono(p, pontos2) && !this.pontoNaBorda(p, pontos2)) {
        return true;
      }
    }

    const pontosInternos2 = this.obterPontosInternos(pontos2);
    for (const p of pontosInternos2) {
      if (this.pontoNoPoligono(p, pontos1) && !this.pontoNaBorda(p, pontos1)) {
        return true;
      }
    }

    return false;
  }
}

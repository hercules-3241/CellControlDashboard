// Older solicitudes stored "CATEGORY - free text" in motivo; newer ones send the text in observacion.
const MOTIVO_CON_TEXTO = /^([A-ZÁÉÍÓÚÑ ]+?)\s+-\s+([\s\S]*)$/;

/**
 * Separar el motivo (categoría) de la observación (texto libre) de una solicitud.
 */
export function separarMotivo(solicitud) {
  const motivo = (solicitud.motivo || '').trim();
  const observacion = (solicitud.observacion || '').trim();

  const match = MOTIVO_CON_TEXTO.exec(motivo);
  if (!match) return { motivo, observacion };

  const textoEmbebido = match[2].trim();
  return {
    motivo: match[1],
    observacion: [textoEmbebido, observacion].filter(Boolean).join(' / '),
  };
}

// Cloudflare Pages Function
// Route: POST /api/submit
// Keeps the Power Automate HTTP-trigger URL (and its SAS secret) out of
// client-side JavaScript. Set POWER_AUTOMATE_URL as an encrypted
// environment variable in the Cloudflare Pages project settings.

const MAX_LEN = { nombre: 120, ciudad: 120, descripcion: 1000, contacto: 200 };
const CATEGORIAS = ['Mentoría', 'Empleo', 'Educación', 'Salud', 'Negocio / emprendimiento', 'Otro'];

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Solicitud inválida' }, 400);
  }

  if (!body.descripcion || !body.descripcion.trim()) {
    return json({ error: 'Falta la descripción' }, 400);
  }
  if (!['Ofrezco', 'Busco'].includes(body.modo)) {
    return json({ error: 'Modo inválido' }, 400);
  }
  if (!CATEGORIAS.includes(body.categoria)) {
    return json({ error: 'Categoría inválida' }, 400);
  }
  if (!body.consiente) {
    return json({ error: 'Falta aceptar el aviso de privacidad' }, 400);
  }

  const payload = {
    modo: body.modo,
    categoria: body.categoria,
    nombre: clip(body.nombre, MAX_LEN.nombre) || 'Anónimo',
    ciudad: clip(body.ciudad, MAX_LEN.ciudad),
    descripcion: clip(body.descripcion, MAX_LEN.descripcion),
    contacto: clip(body.contacto, MAX_LEN.contacto)
  };

  if (!env.POWER_AUTOMATE_URL) {
    return json({ error: 'Servicio no configurado' }, 500);
  }

  let resp;
  try {
    resp = await fetch(env.POWER_AUTOMATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    return json({ error: 'No se pudo contactar el servicio' }, 502);
  }

  if (!resp.ok) {
    return json({ error: 'El servicio rechazó la publicación' }, 502);
  }

  return json({ status: 'ok' }, 200);
}

function clip(value, max) {
  return (typeof value === 'string' ? value.trim() : '').slice(0, max);
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

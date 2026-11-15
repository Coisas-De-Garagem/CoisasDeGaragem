const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'
).replace(/\/$/, '');

export async function uploadImage(file: File): Promise<string> {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Entre na sua conta para enviar fotos.');
  const form = new FormData();
  form.append('file', file);
  const response = await fetch(API_BASE_URL + '/media', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
    body: form,
  });
  const result = (await response.json()) as {
    url?: string;
    message?: string | string[];
  };
  if (!response.ok)
    throw new Error(
      Array.isArray(result.message)
        ? result.message.join(', ')
        : result.message || 'Não foi possível enviar a foto.'
    );
  if (!result.url)
    throw new Error('O servidor não retornou o endereço da foto.');
  return result.url;
}

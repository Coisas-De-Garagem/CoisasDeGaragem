import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

/**
 * Rota-fantasma que apenas redireciona para a listagem de eventos abrindo o
 * modal de criar/editar via router state. Assim deep-links (/seller/events/new
 * e /seller/events/:id/edit) continuam funcionando, mas o formulário em si é
 * um modal gerido pela EventsPage.
 */
export default function EventFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    navigate('/seller/events', {
      replace: true,
      state: id ? { editEventId: id } : { newEvent: true },
    });
  }, [navigate, id]);

  return null;
}

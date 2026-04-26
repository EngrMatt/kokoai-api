const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8077';

export async function getCategories(token: string) {
  const response = await fetch(`${API_URL}/categories/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
}

export async function createCategory(token: string, data: any) {
  const response = await fetch(`${API_URL}/categories/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create category');
  return response.json();
}

export async function updateCategory(token: string, id: string, data: any) {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update category');
  return response.json();
}

export async function deleteCategory(token: string, id: string) {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to delete category');
  return response.json();
}

// Persist first; callers may clear their project/catalog state only on success.
export async function deleteSavedTypes(request) {
  const endpoints=['/api/b2b-types','/api/mekik2-types','/api/mr-types'];
  const results=await Promise.allSettled(endpoints.map(url=>request(url,{method:'DELETE',body:'{}'})));
  const failed=results.find(result=>result.status==='rejected'||result.value?.ok!==true);
  if(failed)throw new Error(failed.reason?.message||'Kayıtlı raf tiplerinin tamamı silinemedi. Tekrar deneyin.');
  const remaining=await Promise.all(endpoints.map(url=>request(url,{cache:'no-store'})));
  if(remaining.some(result=>!Array.isArray(result?.types)||result.types.length))throw new Error('Silme işlemi doğrulanamadı. Kayıtları getirip tekrar deneyin.');
}

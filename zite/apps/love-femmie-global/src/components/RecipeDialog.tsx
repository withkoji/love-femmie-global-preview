import { Bookmark, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth, loginWithRedirect } from 'zitejs/auth';
import { toggleSaved } from 'zitejs/api';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@project/components/ui/dialog';
import { useData, type Recipe } from '../lib/data';

export default function RecipeDialog({ recipe, onClose }: { recipe: Recipe | null; onClose: () => void }) {
  const { user } = useAuth();
  const { me, refreshMe } = useData();
  const saved = !!recipe && !!me?.profile.savedRecipes.includes(recipe.id);
  const save = async () => {
    if (!user) return loginWithRedirect();
    try { const r = await toggleSaved({ kind: 'savedRecipes', itemId: recipe!.id }); toast.success(r.saved ? 'Recipe saved' : 'Removed from saved'); refreshMe(); }
    catch { toast.error('Could not save recipe'); }
  };
  return (
    <Dialog open={!!recipe} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        {recipe && (<>
          <img src={recipe.image} alt="" className="aspect-video w-full rounded-xl object-cover" />
          <DialogHeader><DialogTitle className="text-3xl">{recipe.title}</DialogTitle></DialogHeader>
          <div className="flex flex-wrap gap-2 text-sm"><Badge variant="secondary">{recipe.country} · {recipe.continent}</Badge><Badge variant="outline">{recipe.mealType}</Badge><Badge variant="outline">{recipe.dietTags}</Badge></div>
          <div className="flex gap-5 text-sm text-muted-foreground"><span className="flex gap-1"><Clock className="h-4 w-4" />Prep {recipe.prepMinutes}m · Cook {recipe.cookMinutes}m</span><span className="flex gap-1"><Users className="h-4 w-4" />Serves {recipe.servings}</span></div>
          <p>{recipe.description}</p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div><h4 className="mb-2 text-xl font-semibold">Ingredients</h4><ul className="list-disc space-y-1 pl-5 text-sm">{recipe.ingredients.split('\n').map((i) => <li key={i}>{i}</li>)}</ul></div>
            <div><h4 className="mb-2 text-xl font-semibold">Method</h4><ol className="list-decimal space-y-1 pl-5 text-sm">{recipe.instructions.split('\n').map((i) => <li key={i}>{i}</li>)}</ol></div>
          </div>
          <div className="rounded-xl bg-muted p-4 text-sm space-y-1"><p><b>Allergens:</b> {recipe.allergens}</p><p><b>Nutrition:</b> {recipe.nutritionNotes}</p><p><b>Food safety:</b> Cook meats to safe internal temperatures and refrigerate leftovers within 2 hours.</p></div>
          <Button variant={saved ? 'outline' : 'default'} onClick={save}><Bookmark className="mr-2 h-4 w-4" />{saved ? 'Saved' : 'Save recipe'}</Button>
        </>)}
      </DialogContent>
    </Dialog>
  );
}

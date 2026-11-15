import { Lock, Captions } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@project/components/ui/button';
import { Badge } from '@project/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@project/components/ui/dialog';
import { useRef } from 'react';
import { saveWatchProgress } from 'zitejs/api';
import { canAccess, useData, type Video } from '../lib/data';

export default function VideoDialog({ video, onClose }: { video: Video | null; onClose: () => void }) {
  const { me, refreshMe } = useData();
  const last = useRef(0);
  const ok = video && canAccess(me?.profile.plan, video.requiredPlan) && !(me?.profile.kidsMode && !['Kids', 'All Ages'].includes(video.ageRating));
  const savePos = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const t = e.currentTarget.currentTime;
    if (!video || !me || Math.abs(t - last.current) < 5) return;
    last.current = t;
    saveWatchProgress({ videoId: video.id, position: t }).catch(() => {});
  };
  const resume = (e: React.SyntheticEvent<HTMLVideoElement>) => { const pos = me?.watchHistory.find((w) => w.videoId === video?.id)?.position ?? 0; last.current = pos; e.currentTarget.currentTime = pos; };
  const close = () => { onClose(); if (me) refreshMe(); };
  return (
    <Dialog open={!!video} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-3xl">
        {video && (<>
          <DialogHeader><DialogTitle className="text-3xl">{video.title}</DialogTitle></DialogHeader>
          <div className="flex flex-wrap gap-2"><Badge variant="secondary">{video.collection}</Badge><Badge variant="outline">{video.ageRating}</Badge>{video.hasCaptions && <Badge variant="outline"><Captions className="mr-1 h-3 w-3" />CC</Badge>}<Badge variant="outline">Demo media</Badge></div>
          {ok ? (
            <video key={video.id} src={video.videoUrl} controls autoPlay poster={video.thumbnail} onLoadedMetadata={resume} onTimeUpdate={savePos} className="aspect-video w-full rounded-xl bg-black" />
          ) : (
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <img src={video.thumbnail} alt="" className="h-full w-full object-cover blur-sm" />
              <div className="absolute inset-0 grid place-items-center bg-black/50 text-center text-white">
                <div><Lock className="mx-auto mb-2" /><p className="mb-3">Included with {video.requiredPlan} and above</p><Button asChild onClick={onClose}><Link to="/membership">See plans</Link></Button></div>
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground">{video.description} · {video.durationMinutes} min</p>
        </>)}
      </DialogContent>
    </Dialog>
  );
}

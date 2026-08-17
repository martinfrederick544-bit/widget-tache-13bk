import FrameGuard from '@/components/FrameGuard';
import Board from '@/components/Board';

export default function CarolinePage() {
  return (
    <FrameGuard>
      <Board person="caroline" displayName="Caroline" accent="#db2777" accentSoft="#fce7f3" />
    </FrameGuard>
  );
}

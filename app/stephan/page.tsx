import FrameGuard from '@/components/FrameGuard';
import Board from '@/components/Board';

export default function StephanPage() {
  return (
    <FrameGuard>
      <Board person="stephan" displayName="Stéphan" accent="#2563eb" accentSoft="#dbeafe" />
    </FrameGuard>
  );
}

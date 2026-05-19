import RoomLayout from "@/components/layout/RoomLayout";

export default function WellPage() {
  return (
    <RoomLayout roomName="THE WELL" roomSlug="well">
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="font-serif italic text-[28px] md:text-[36px] text-way-text leading-[1.4] mb-4">
          &ldquo;The Well is coming soon.&rdquo;
        </p>
        <p className="font-sans text-sm text-way-gray max-w-sm">
          Draw living water for your soul. Prayer, reflection, and deep refreshment await.
        </p>
      </div>
    </RoomLayout>
  );
}

import RoomLayout from "@/components/layout/RoomLayout";

export default function SanctuaryPage() {
  return (
    <RoomLayout roomName="THE SANCTUARY" roomSlug="sanctuary">
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="font-serif italic text-[28px] md:text-[36px] text-way-text leading-[1.4] mb-4">
          &ldquo;The Sanctuary is coming soon.&rdquo;
        </p>
        <p className="font-sans text-sm text-way-gray max-w-sm">
          Rest, reset, and return to peace. A sacred space for stillness and prayer.
        </p>
      </div>
    </RoomLayout>
  );
}

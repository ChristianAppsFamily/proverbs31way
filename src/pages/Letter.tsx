import RoomLayout from "@/components/layout/RoomLayout";

export default function LetterPage() {
  return (
    <RoomLayout roomName="THE LETTER" roomSlug="letter">
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p className="font-serif italic text-[28px] md:text-[36px] text-way-text leading-[1.4] mb-4">
          &ldquo;The Letter is coming soon.&rdquo;
        </p>
        <p className="font-sans text-sm text-way-gray max-w-sm">
          Write your heart. Share your story. A quiet space for honest words and deep connection.
        </p>
      </div>
    </RoomLayout>
  );
}

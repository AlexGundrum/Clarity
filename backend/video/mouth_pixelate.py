"""Selective mouth-region pixelation using MediaPipe Face Mesh.

Detects lip landmarks and applies pixelation only around the mouth area
for a network-glitch camouflage effect.
"""

import cv2
import numpy as np
from pathlib import Path
from typing import Optional, Tuple

try:
    from mediapipe.tasks import python as mp_python
    from mediapipe.tasks.python import vision
    USE_NEW_API = True
except ImportError:
    USE_NEW_API = False


class MouthPixelator:
    def __init__(self, mouth_pixelation_factor: int = 5, frame_scale: float = 0.75, feather_radius: int = 8):
        """Initialize face detection for lip region.
        
        Args:
            mouth_pixelation_factor: How much to downscale mouth (lower = less pixelated)
            frame_scale: Scale factor for entire frame (0.75 = 75% resolution)
            feather_radius: Blur radius for edge feathering (smoother blend)
        """
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.mouth_pixelation_factor = mouth_pixelation_factor
        self.frame_scale = frame_scale
        self.feather_radius = feather_radius
        self.cached_mouth_bbox = None

    def _get_mouth_region(self, frame: np.ndarray) -> Optional[Tuple[int, int, int, int]]:
        """Extract bounding box around mouth using face detection.
        
        Returns:
            (x, y, w, h) bounding box or None if no face detected
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            return None
        
        # Use the first detected face
        fx, fy, fw, fh = faces[0]
        
        # Mouth is typically in the lower half of the face
        # Estimate mouth region as bottom 40% of face, centered horizontally
        mouth_y_start = fy + int(fh * 0.6)
        mouth_height = int(fh * 0.4)
        mouth_x_start = fx + int(fw * 0.2)
        mouth_width = int(fw * 0.6)
        
        return (mouth_x_start, mouth_y_start, mouth_width, mouth_height)

    def pixelate_mouth_region(self, frame: np.ndarray, use_cached: bool = True) -> np.ndarray:
        """Apply selective pixelation to mouth region + subtle full-frame downscale.
        
        Args:
            frame: Input BGR frame from OpenCV
            use_cached: Use cached mouth bbox instead of detecting every frame
            
        Returns:
            Frame with network-glitch effect (reduced resolution + pixelated mouth)
        """
        img_h, img_w = frame.shape[:2]
        
        # Apply subtle resolution reduction to entire frame for network-glitch realism
        if self.frame_scale < 1.0:
            scaled_w = int(img_w * self.frame_scale)
            scaled_h = int(img_h * self.frame_scale)
            frame = cv2.resize(frame, (scaled_w, scaled_h), interpolation=cv2.INTER_LINEAR)
            frame = cv2.resize(frame, (img_w, img_h), interpolation=cv2.INTER_LINEAR)
        
        # Detect mouth region once or use cached bbox
        if use_cached and self.cached_mouth_bbox is not None:
            mouth_bbox = self.cached_mouth_bbox
        else:
            mouth_bbox = self._get_mouth_region(frame)
            if mouth_bbox is not None:
                self.cached_mouth_bbox = mouth_bbox
        
        if mouth_bbox is None:
            # No face detected - return frame with just resolution reduction
            return frame
            
        x, y, w, h = mouth_bbox
        
        # Extract mouth region
        mouth_region = frame[y:y+h, x:x+w].copy()
        
        # Apply lighter pixelation to mouth region
        small_w = max(w // self.mouth_pixelation_factor, 1)
        small_h = max(h // self.mouth_pixelation_factor, 1)
        
        small = cv2.resize(mouth_region, (small_w, small_h), interpolation=cv2.INTER_LINEAR)
        pixelated = cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)
        
        # Create feathered mask for smooth blending
        mask = np.ones((h, w), dtype=np.float32)
        if self.feather_radius > 0:
            mask = cv2.GaussianBlur(mask, (self.feather_radius * 2 + 1, self.feather_radius * 2 + 1), 0)
        
        # Blend pixelated region with original using mask
        result = frame.copy()
        for c in range(3):
            result[y:y+h, x:x+w, c] = (
                mask * pixelated[:, :, c] + (1 - mask) * frame[y:y+h, x:x+w, c]
            ).astype(np.uint8)
        
        return result

    def process_video(self, input_path: Path, output_path: Path) -> None:
        """Process entire video with selective mouth pixelation + subtle resolution reduction.
        
        Args:
            input_path: Path to input video
            output_path: Path to save output video
        """
        cap = cv2.VideoCapture(str(input_path))
        
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(str(output_path), fourcc, fps, (width, height))
        
        frame_count = 0
        first_frame = True
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Detect mouth region on first frame, then cache it for speed
            use_cached = not first_frame
            processed = self.pixelate_mouth_region(frame, use_cached=use_cached)
            out.write(processed)
            frame_count += 1
            first_frame = False
            
            if frame_count % 100 == 0:
                print(f"Processed {frame_count} frames...")
        
        cap.release()
        out.release()
        print(f"Done: {frame_count} frames processed")

